var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// vite.config.ts
import path from "path";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
var vite_config_default = defineConfig(({ mode }) => {
  const baseConfig = defineConfig({
    plugins: [
      react(),
      tsconfigPaths(),
      __spreadProps(__spreadValues({}, checker({
        overlay: false,
        typescript: true,
        eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"' }
      })), {
        apply: "serve"
      })
    ],
    resolve: {
      alias: {
        "@generator": path.resolve("/home/charlesbadger/Documents/blog", "generator"),
        "@app": path.resolve("/home/charlesbadger/Documents/blog", "src"),
        "~": path.resolve("/home/charlesbadger/Documents/blog", "src")
      }
    },
    test: {
      globals: true,
      environment: "jsdom",
      reporters: "verbose",
      setupFiles: ["./setupTests.ts"]
    }
  });
  switch (mode) {
    case "ssr":
      return __spreadProps(__spreadValues({}, baseConfig), {
        build: {
          outDir: "generator/_lib",
          ssr: "generator/app/server.tsx",
          rollupOptions: {
            output: {
              format: "es"
            }
          }
        }
      });
    default:
      return __spreadProps(__spreadValues({}, baseConfig), {
        build: {
          outDir: "build"
        }
      });
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwidml0ZXN0XCIgLz5cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCBjaGVja2VyIGZyb20gJ3ZpdGUtcGx1Z2luLWNoZWNrZXInO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gJ3ZpdGUtdHNjb25maWctcGF0aHMnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGJhc2VDb25maWcgPSBkZWZpbmVDb25maWcoe1xuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlYWN0KCksXG4gICAgICB0c2NvbmZpZ1BhdGhzKCksXG4gICAgICB7XG4gICAgICAgIC4uLmNoZWNrZXIoe1xuICAgICAgICAgIG92ZXJsYXk6IGZhbHNlLFxuICAgICAgICAgIHR5cGVzY3JpcHQ6IHRydWUsXG4gICAgICAgICAgZXNsaW50OiB7IGxpbnRDb21tYW5kOiAnZXNsaW50IFwiLi9zcmMvKiovKi57dHMsdHN4fVwiJyB9LFxuICAgICAgICB9KSxcbiAgICAgICAgYXBwbHk6ICdzZXJ2ZScsXG4gICAgICB9LFxuICAgIF0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ0BnZW5lcmF0b3InOiBwYXRoLnJlc29sdmUoXCIvaG9tZS9jaGFybGVzYmFkZ2VyL0RvY3VtZW50cy9ibG9nXCIsICdnZW5lcmF0b3InKSxcbiAgICAgICAgJ0BhcHAnOiBwYXRoLnJlc29sdmUoXCIvaG9tZS9jaGFybGVzYmFkZ2VyL0RvY3VtZW50cy9ibG9nXCIsICdzcmMnKSxcbiAgICAgICAgJ34nOiBwYXRoLnJlc29sdmUoXCIvaG9tZS9jaGFybGVzYmFkZ2VyL0RvY3VtZW50cy9ibG9nXCIsICdzcmMnKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICB0ZXN0OiB7XG4gICAgICBnbG9iYWxzOiB0cnVlLFxuICAgICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgICByZXBvcnRlcnM6ICd2ZXJib3NlJyxcbiAgICAgIHNldHVwRmlsZXM6IFsnLi9zZXR1cFRlc3RzLnRzJ10sXG4gICAgfSxcbiAgfSk7XG5cbiAgc3dpdGNoIChtb2RlKSB7XG4gICAgY2FzZSAnc3NyJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmJhc2VDb25maWcsXG4gICAgICAgIGJ1aWxkOiB7XG4gICAgICAgICAgb3V0RGlyOiAnZ2VuZXJhdG9yL19saWInLFxuICAgICAgICAgIHNzcjogJ2dlbmVyYXRvci9hcHAvc2VydmVyLnRzeCcsXG4gICAgICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICAgIGZvcm1hdDogJ2VzJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmJhc2VDb25maWcsXG4gICAgICAgIGJ1aWxkOiB7XG4gICAgICAgICAgb3V0RGlyOiAnYnVpbGQnLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgfVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxXQUFXO0FBQ3hDLFFBQU0sYUFBYSxhQUFhO0FBQUEsSUFDOUIsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04sY0FBYztBQUFBLE1BQ2QsaUNBQ0ssUUFBUTtBQUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsWUFBWTtBQUFBLFFBQ1osUUFBUSxFQUFFLGFBQWEsK0JBQStCO0FBQUEsTUFDeEQsQ0FBQyxJQUxIO0FBQUEsUUFNRSxPQUFPO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLGNBQWMsS0FBSyxRQUFRLHNDQUFzQyxXQUFXO0FBQUEsUUFDNUUsUUFBUSxLQUFLLFFBQVEsc0NBQXNDLEtBQUs7QUFBQSxRQUNoRSxLQUFLLEtBQUssUUFBUSxzQ0FBc0MsS0FBSztBQUFBLE1BQy9EO0FBQUEsSUFDRjtBQUFBLElBQ0EsTUFBTTtBQUFBLE1BQ0osU0FBUztBQUFBLE1BQ1QsYUFBYTtBQUFBLE1BQ2IsV0FBVztBQUFBLE1BQ1gsWUFBWSxDQUFDLGlCQUFpQjtBQUFBLElBQ2hDO0FBQUEsRUFDRixDQUFDO0FBRUQsVUFBUTtBQUFBLFNBQ0Q7QUFDSCxhQUFPLGlDQUNGLGFBREU7QUFBQSxRQUVMLE9BQU87QUFBQSxVQUNMLFFBQVE7QUFBQSxVQUNSLEtBQUs7QUFBQSxVQUNMLGVBQWU7QUFBQSxZQUNiLFFBQVE7QUFBQSxjQUNOLFFBQVE7QUFBQSxZQUNWO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUE7QUFFQSxhQUFPLGlDQUNGLGFBREU7QUFBQSxRQUVMLE9BQU87QUFBQSxVQUNMLFFBQVE7QUFBQSxRQUNWO0FBQUEsTUFDRjtBQUFBO0FBRU4sQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
