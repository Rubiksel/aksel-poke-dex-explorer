import type { StorybookConfig } from "@storybook/angular";
import type { AddonOptionsWebpack } from "@storybook/addon-coverage";

const coverageConfig: AddonOptionsWebpack = {
  istanbul: {
    include: ["../src/app/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  },
};

const config: StorybookConfig = {
  stories: ["../src/app/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-docs",
    "msw-storybook-addon",
    "@storybook/addon-coverage",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/angular",
    options: {},
  },
  staticDirs: ["../public"],
  webpackFinal: async (config) => {
    config.module?.rules?.push({
      test: /\.css$/i,
      use: ["style-loader", "css-loader"],
      include: [/node_modules/, /src/],
    });
    return config;
  },
};
export default config;
