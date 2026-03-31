import { defineConfig } from "@playwright/test";
export default defineConfig({
    testDir: "./tests",
    use: {
        baseURL: "http://127.0.0.1:8080",
        viewport: { width: 390, height: 844 }
    },
    webServer: {
        command: "npm run build && npm run start",
        port: 8080,
        cwd: ".",
        reuseExistingServer: true
    }
});
