import WebSocket from "ws";
import fs from "fs";
import crypto from "crypto";

// Gunakan algoritma DRM v2 resmi untuk handshake Microsoft Edge TTS
const {
  generateSecMsGecToken_V2,
  SEC_MS_GEC_VERSION_V2,
  TRUSTED_CLIENT_TOKEN,
  CHROMIUM_FULL_VERSION,
} = require("node-edge-tts/dist/drm.js");

export interface SynthesizeOptions {
  text: string;
  voice: string;
  outputPath: string;
  timeoutMs?: number;
}

/**
 * Client Edge-TTS Native mandiri tanpa bug header 'host'
 * Mencegah error HTTP 429 Rate-Limit / Host Mismatch dari server Microsoft
 */
export async function synthesizeToFile({
  text,
  voice,
  outputPath,
  timeoutMs = 15000,
}: SynthesizeOptions): Promise<void> {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await attemptSynthesize(text, voice, outputPath, timeoutMs);
      return; // Berhasil
    } catch (err: any) {
      console.warn(`[EdgeTTS] Percobaan ${attempt}/${maxRetries} gagal: ${err.message}`);
      if (attempt === maxRetries) {
        throw new Error(`Gagal sintesis Edge-TTS setelah ${maxRetries} percobaan: ${err.message}`);
      }
      // Jeda retry bertahap (1.5s, 3s)
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }
}

function attemptSynthesize(
  text: string,
  voice: string,
  outputPath: string,
  timeoutMs: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    let isFinished = false;
    const token = generateSecMsGecToken_V2();
    const url = `wss://api.msedgeservices.com/tts/cognitiveservices/websocket/v1?Ocp-Apim-Subscription-Key=${TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${token}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION_V2}`;

    const majorVersion = CHROMIUM_FULL_VERSION.split(".")[0];
    const ws = new WebSocket(url, {
      origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
      headers: {
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${majorVersion}.0.0.0 Safari/537.36 Edg/${majorVersion}.0.0.0`,
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    const timer = setTimeout(() => {
      if (!isFinished) {
        isFinished = true;
        try {
          ws.terminate();
        } catch {}
        reject(new Error("Timeout saat menghubungi server Edge TTS."));
      }
    }, timeoutMs);

    const requestId = crypto.randomUUID().replace(/-/g, "");
    const audioChunks: Buffer[] = [];

    ws.on("open", () => {
      // 1. Konfigurasi audio format MP3
      const configPayload = JSON.stringify({
        context: {
          synthesis: {
            audio: {
              metadataoptions: {
                sentenceBoundaryEnabled: "false",
                wordBoundaryEnabled: "false",
              },
              outputFormat: "audio-24khz-48kbitrate-mono-mp3",
            },
          },
        },
      });

      const configMsg =
        `X-Timestamp:${new Date().toISOString()}\r\n` +
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        configPayload;

      ws.send(configMsg);

      // 2. Kirim SSML teks yang disuarakan
      const escapedText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="id-ID"><voice name="${voice}">${escapedText}</voice></speak>`;

      const ssmlMsg =
        `X-RequestId:${requestId}\r\n` +
        `X-Timestamp:${new Date().toISOString()}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `Path:ssml\r\n\r\n` +
        ssml;

      ws.send(ssmlMsg);
    });

    ws.on("message", (data: any, isBinary: boolean) => {
      if (isBinary) {
        // Data audio biner: 2 bytes pertama adalah panjang metadata header teks
        const buffer = Buffer.from(data);
        if (buffer.length > 2) {
          const headerLen = buffer.readUInt16BE(0);
          const audioData = buffer.subarray(headerLen + 2);
          if (audioData.length > 0) {
            audioChunks.push(audioData);
          }
        }
      } else {
        const textMessage = data.toString();
        // Cek sinyal selesai
        if (textMessage.includes("Path:turn.end")) {
          if (!isFinished) {
            isFinished = true;
            clearTimeout(timer);
            try {
              ws.close();
            } catch {}

            const completeBuffer = Buffer.concat(audioChunks);
            if (completeBuffer.length === 0) {
              reject(new Error("Audio diterima kosong dari Edge TTS."));
              return;
            }

            fs.writeFileSync(outputPath, completeBuffer);
            resolve();
          }
        }
      }
    });

    ws.on("error", (err: any) => {
      if (!isFinished) {
        isFinished = true;
        clearTimeout(timer);
        reject(err);
      }
    });

    ws.on("close", (code: any) => {
      if (!isFinished) {
        isFinished = true;
        clearTimeout(timer);
        if (audioChunks.length > 0) {
          const completeBuffer = Buffer.concat(audioChunks);
          fs.writeFileSync(outputPath, completeBuffer);
          resolve();
        } else {
          reject(new Error(`Koneksi WebSocket tertutup sebelum audio selesai (code ${code}).`));
        }
      }
    });
  });
}
