import type { Preview } from "@storybook/angular";
import { setCompodocJson } from "@storybook/addon-docs/angular";
import { initialize, mswLoader } from "msw-storybook-addon";
import "../src/styles.css";

import docJson from "../documentation.json";

setCompodocJson(docJson);

initialize();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  loaders: [mswLoader],
};

export default preview;
