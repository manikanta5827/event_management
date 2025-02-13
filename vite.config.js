export default defineConfig({
    // ... other config
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
                secure: false
            },
            '/socket.io': {
                target: 'http://localhost:4000',
                changeOrigin: true,
                secure: false,
                ws: true
            }
        }
    }
}); 