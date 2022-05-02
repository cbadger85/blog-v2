// vite.config.ts
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import ssg from "@blog/generator";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    {
      ...checker({
        overlay: false,
        typescript: true,
        eslint: { lintCommand: 'eslint "./**/*.{ts,tsx}"' }
      }),
      apply: "serve"
    },
    ssg()
  ],
  build: {
    outDir: "build",
    emptyOutDir: true
  },
  server: {},
  test: {
    globals: true,
    environment: "jsdom",
    reporters: "verbose",
    setupFiles: ["./setupTests.ts"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwidml0ZXN0XCIgLz5cblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgY2hlY2tlciBmcm9tICd2aXRlLXBsdWdpbi1jaGVja2VyJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJztcbmltcG9ydCBzc2cgZnJvbSAnQGJsb2cvZ2VuZXJhdG9yJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgdHNjb25maWdQYXRocygpLFxuICAgIHtcbiAgICAgIC4uLmNoZWNrZXIoe1xuICAgICAgICBvdmVybGF5OiBmYWxzZSxcbiAgICAgICAgdHlwZXNjcmlwdDogdHJ1ZSxcbiAgICAgICAgZXNsaW50OiB7IGxpbnRDb21tYW5kOiAnZXNsaW50IFwiLi8qKi8qLnt0cyx0c3h9XCInIH0sXG4gICAgICB9KSxcbiAgICAgIGFwcGx5OiAnc2VydmUnLFxuICAgIH0sXG4gICAgc3NnKCksXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnYnVpbGQnLFxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICAvLyBvcGVuOiB0cnVlLFxuICB9LFxuICB0ZXN0OiB7XG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcbiAgICByZXBvcnRlcnM6ICd2ZXJib3NlJyxcbiAgICBzZXR1cEZpbGVzOiBbJy4vc2V0dXBUZXN0cy50cyddLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLGNBQWM7QUFBQSxJQUNkO0FBQUEsU0FDSyxRQUFRO0FBQUEsUUFDVCxTQUFTO0FBQUEsUUFDVCxZQUFZO0FBQUEsUUFDWixRQUFRLEVBQUUsYUFBYSwyQkFBMkI7QUFBQSxNQUNwRCxDQUFDO0FBQUEsTUFDRCxPQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsSUFBSTtBQUFBLEVBQ047QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLGFBQWE7QUFBQSxFQUNmO0FBQUEsRUFDQSxRQUFRLENBRVI7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFdBQVc7QUFBQSxJQUNYLFlBQVksQ0FBQyxpQkFBaUI7QUFBQSxFQUNoQztBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
