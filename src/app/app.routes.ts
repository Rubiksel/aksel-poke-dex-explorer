import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PokemonListComponent } from './pokemon-list/pokemon-list.component';
import { PokemonDataSheetComponent } from './pokemon-data-sheet/pokemon-data-sheet.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'pokemons', component: PokemonListComponent },
  { path: 'pokemon/:id', component: PokemonDataSheetComponent },
];
