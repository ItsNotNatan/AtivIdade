import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Ao mudar para false, se a 5173 estiver ocupada por um terminal antigo, 
    // o Vite arranca na 5175, 5176, etc., sem mostrar erro.
    strictPort: false
  }
})