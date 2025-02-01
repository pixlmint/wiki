// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  root: './app',
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-'),
          whitespace: 'preserve',
          comments: true
        }
      },
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }),
    react(), // For React components via Veaury
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './app/src'),
      '@style': resolve(__dirname, './app/style'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@style/variables" as *;`,
      },
    },
  },
  optimizeDeps: {
    include: [
      'vue',
      'react',
      'react-dom',
      '@toast-ui/editor',
      'd3',
      'mathjax',
      'prismjs',
      'element-plus',
      'veaury',
    ],
  },
  build: {
    target: 'es2015',
    outDir: '../dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'app/index.html'),
      },
      output: {
        manualChunks: {
          'vendor': [
            'vue',
            'react',
            'react-dom',
            'pinia',
            'element-plus',
          ],
          'editor': ['@toast-ui/editor'],
          'viz': ['d3'],
        },
      },
    },
  },
  publicDir: resolve(__dirname, 'app/public'),
})
