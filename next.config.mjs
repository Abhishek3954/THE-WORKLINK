/** @type {import('next').NextConfig} */
import os from 'os';

function getLocalIPs() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const iface of Object.values(nets)) {
    for (const net of iface) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  devIndicators: {
    buildActivity: false,
  },
  // Keep your network settings as they were
  allowedDevOrigins: getLocalIPs(),
 
}

export default nextConfig;