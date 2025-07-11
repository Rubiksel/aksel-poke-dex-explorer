import { Routes, withComponentInputBinding } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { PokemonListComponent } from "./pokemon-list/pokemon-list.component";
import { PokemonDetailedViewComponent } from "./pokemon-detailed-view/pokemon-detailed-view.component";
import { listPasswordGuard } from "./list-password.guard";

export const routes: Routes = [
  { path: "", component: HomeComponent },
  {
    path: "pokemons",
    component: PokemonListComponent,
    // canActivate: [listPasswordGuard],
  },
  {
    path: "pokemons/:name",
    component: PokemonDetailedViewComponent,
  },
];
