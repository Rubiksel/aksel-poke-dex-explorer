// src/app/pokemon-list/pokemon-list.stories.ts
import type { Meta, StoryObj } from "@storybook/angular";
import { applicationConfig } from "@storybook/angular";
import { provideRouter, withDisabledInitialNavigation } from "@angular/router";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { http, HttpResponse, delay } from "msw";

import { PokemonListComponent } from "./pokemon-list.component";

// --- Helpers -------------------------------------------------------------------
const TOTAL_COUNT = 1025; // arbitrary-but-realistic total species count

function makeResults(offset: number, limit: number) {
  // Generate placeholder species like "pokemon-1", "pokemon-2", ...
  return Array.from({ length: limit }, (_, i) => {
    const id = offset + i + 1;
    return {
      name: `pokemon-${id}`,
      url: `https://pokeapi.co/api/v2/pokemon-species/${id}/`,
    };
  });
}

function buildListResponse(offset: number, limit: number) {
  return {
    count: TOTAL_COUNT,
    results: makeResults(offset, limit),
  };
}

// Default handler that respects ?offset=&limit= query params
const speciesListHandler = http.get(
  "https://pokeapi.co/api/v2/pokemon-species*",
  ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "12");
    const offset = Number(url.searchParams.get("offset") ?? "0");
    return HttpResponse.json(buildListResponse(offset, limit));
  }
);

// --- Meta ----------------------------------------------------------------------
const meta: Meta<PokemonListComponent> = {
  title: "PokemonList",
  component: PokemonListComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([], withDisabledInitialNavigation()),
        provideHttpClient(withFetch()),
      ],
    }),
  ],
  parameters: {
    layout: "fullscreen",
    msw: { handlers: [speciesListHandler] },
  },
};
export default meta;

type Story = StoryObj<PokemonListComponent>;

export const Loading: Story = {
  name: "Loading",
  args: { page: 0, limit: 12 },
  parameters: {
    msw: {
      handlers: [
        http.get("https://pokeapi.co/api/v2/pokemon-species*", () => {
          return new Promise<never>(() => {});
        }),
      ],
    },
  },
};

export const PerPage12: Story = {
  name: "12 per page",
  args: { page: 0, limit: 12 },
};

export const PerPage24: Story = {
  name: "24 per page",
  args: { page: 0, limit: 24 },
};

export const PerPage48: Story = {
  name: "48 per page",
  args: { page: 0, limit: 48 },
};

export const PerPage72: Story = {
  name: "72 per page",
  args: { page: 0, limit: 72 },
};
