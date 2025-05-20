import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: ['src/url-state.ts'],
            name: 'mapglUrlState',
            formats: ['es']
        },
    },
});
