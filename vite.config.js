import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api/kimi': {
          target: 'https://api.moonshot.cn',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/kimi/, '/v1'),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              const apiKey = env.VITE_OPENAI_API_KEY || 'sk-IHbW2Yv3j69Gh3TE4WR2jhf8022gHn7I9bzWDdUPZMqLsjj5';
              proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
            });
          }
        }
      }
    },
  }
})
