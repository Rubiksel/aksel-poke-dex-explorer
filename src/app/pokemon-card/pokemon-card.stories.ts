import type { Meta, StoryObj } from "@storybook/angular";
import { applicationConfig } from "@storybook/angular";
import { provideRouter } from "@angular/router";
import { PokemonCardComponent } from "./pokemon-card.component";
import type { Pokemon, PokemonSpecies } from "../_core/models/pokemon";
import { userEvent, within, expect, fn } from "storybook/test";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
const asPokemon = (p: DeepPartial<Pokemon>) => p as unknown as Pokemon;
const asSpecies = (s: DeepPartial<PokemonSpecies>) =>
  s as unknown as PokemonSpecies;

const pikachu = asPokemon({
  id: 25,
  name: "pikachu",
  sprites: {
    front_default:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    other: {
      "official-artwork": {
        front_default:
          "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
      },
    },
  },
  types: [{ type: { name: "electric" } }],
  abilities: [
    { ability: { name: "static" } },
    { ability: { name: "lightning-rod" } },
  ],
});

const pikachuSpeciesSingle = asSpecies({
  name: "pikachu",
  is_legendary: false,
  varieties: [{ pokemon: { name: "pikachu" } }],
});

const pikachuSpeciesMulti = asSpecies({
  name: "pikachu",
  is_legendary: false,
  varieties: [
    { pokemon: { name: "pikachu" } },
    { pokemon: { name: "pikachu-gmax" } },
    { pokemon: { name: "pikachu-rock-star" } },
  ],
});

const pikachuSpeciesLegendaryMulti = asSpecies({
  name: "pikachu",
  is_legendary: true,
  varieties: [
    { pokemon: { name: "pikachu" } },
    { pokemon: { name: "pikachu-gmax" } },
    { pokemon: { name: "pikachu-rock-star" } },
  ],
});

const pikachuSpeciesLegendarySingle = asSpecies({
  name: "pikachu",
  is_legendary: true,
  varieties: [{ pokemon: { name: "pikachu" } }],
});

const arbok = asPokemon({
  sprites: {
    front_default:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/24.png",
  },
});
const arbokSpecies = asSpecies({ name: "arbok" });

const raichu = asPokemon({
  sprites: {
    front_default:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png",
  },
});
const raichuSpecies = asSpecies({ name: "raichu" });

const meta: Meta<PokemonCardComponent> = {
  title: "Pokemon Card",
  component: PokemonCardComponent,
  decorators: [applicationConfig({ providers: [provideRouter([])] })],
  args: {
    pokemon: pikachu,
    basePokemon: pikachu,
    pokemonSpecies: pikachuSpeciesSingle,
    selectedForm: "pikachu",
    flavorText:
      "Possesses cheek sacs in which it stores electricity. This clever forest-dweller roasts tough berries with an electric shock before consuming them.",
    latestCry:
      "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg",
    legacyCry:
      "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/25.ogg",
    previousSpecies: arbokSpecies,
    previousPokemon: arbok,
    nextSpecies: raichuSpecies,
    nextPokemon: raichu,
    height: "1'4\"",
    weight: "13.2 lbs",
  },
};
export default meta;

export const Default: StoryObj<PokemonCardComponent> = {};

export const OneCry: StoryObj<PokemonCardComponent> = {
  args: {
    ...Default.args,
    legacyCry: undefined,
  },
};

export const MultiForm: StoryObj<PokemonCardComponent> = {
  args: {
    ...Default.args,
    pokemonSpecies: pikachuSpeciesMulti,
    formSelected: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const select = canvas.getByRole("combobox");

    await userEvent.selectOptions(select, "pikachu-gmax");
    await expect(select).toHaveValue("pikachu-gmax");
    await expect(args.formSelected).toHaveBeenCalledWith("pikachu-gmax");

    await userEvent.selectOptions(select, "pikachu-rock-star");
    await expect(select).toHaveValue("pikachu-rock-star");
    await expect(args.formSelected).toHaveBeenCalledWith("pikachu-rock-star");
  },
};

export const Legendary: StoryObj<PokemonCardComponent> = {
  args: {
    ...Default.args,
    pokemonSpecies: pikachuSpeciesLegendarySingle,
  },
};

export const MultiFormLegendary: StoryObj<PokemonCardComponent> = {
  args: {
    ...Default.args,
    pokemonSpecies: pikachuSpeciesLegendaryMulti,
  },
};
