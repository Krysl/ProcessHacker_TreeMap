import { defineConfig, mergeConfig, UserConfig, UserConfigFn } from "vite";

const config = defineConfig((env) => {
  const baseConfig = defineConfig({
    root: "./src/",
    base: "./",
    build: {
      // sourcemap: "inline",
      // minify: false,
      // lib: {
      //   entry: "index.ts",
      //   name: "ProcessHackarTreemapMemory",
      //   // fileName: (format) => `ProcessHackarTreemapMemory.${format}.js`,
      // },
      outDir: "../dist"
    },
    esbuild: {
      supported: {
        'top-level-await': true
      },
    },
  });
  let customConfig: UserConfig;
  if (env.command === "serve") {
    customConfig = {
      // serve 独有配置
      // server: {
      //   fs:{
      //     allow: true,
      //   },
      //   proxy: {
      //     "^/_m/.*": {
      //       target: "http://localhost:3000",
      //       changeOrigin: true,
      //       rewrite: (path) => path.replace(/^\/_m/, ""),
      //     },
      //   },
      // },
    };
  } else {
    customConfig = {
      // build 独有配置

    };
  }
  return mergeConfig(baseConfig, customConfig);
}) as UserConfigFn;

export default config;
