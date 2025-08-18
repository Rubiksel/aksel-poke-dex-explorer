import type { Meta, StoryObj } from "@storybook/angular";
import { PokemonErrorComponent } from "./pokemon-error.component";

const meta: Meta<PokemonErrorComponent> = {
  title: "Pokemon Error",
  component: PokemonErrorComponent,
  parameters: {
    layout: "centered",
  },
};
export default meta;

export const NotFound: StoryObj<PokemonErrorComponent> = {};
