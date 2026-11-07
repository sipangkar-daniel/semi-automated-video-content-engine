/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@remotion/player", "remotion"],
  experimental: {
    serverComponentsExternalPackages: [
      "node-edge-tts",
      "ws",
      "music-metadata",
      "bufferutil",
      "utf-8-validate",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals || {}]),
        "bufferutil",
        "utf-8-validate",
        "node-edge-tts",
        "ws",
      ];
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        child_process: false,
      };
    }
    return config;
  },
};

export default nextConfig;

