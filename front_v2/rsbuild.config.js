// @ts-check
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  html: {
    favicon: './public/favicon.svg',
    title: 'Ангар',
    meta: {
      viewport:
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
    },
  },
  plugins: [
    pluginReact({
      reactCompiler: true,
    }),
  ],
});
