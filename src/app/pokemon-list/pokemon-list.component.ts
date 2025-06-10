import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-pokemon-list',
  imports: [CommonModule, MatPaginatorModule, RouterModule],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.css',
})
export class PokemonListComponent implements OnInit {
  pokemons: any[] = [];
  types: any[] = [];
  currentPage = 0;
  limit = 0;
  offset = 0;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  getTypes() {
    return this.http.get(`https://pokeapi.co/api/v2/type`);
  }

  getTypeData(url: string) {
    return this.http.get(`${url}`);
  }

  getPokemonSpecies(limit: number, offset: number) {
    return this.http.get(
      `https://pokeapi.co/api/v2/pokemon-species?limit=${limit}&offset=${offset}`
    );
  }

  async getPokemonInfo(limit: number = 12, offset: number = 0) {
    const typeResponse: any = await firstValueFrom(this.getTypes());
    const typePromises = typeResponse.results.map((result: any) =>
      firstValueFrom(this.getTypeData(result.url))
    );

    const speciesResponse: any = await firstValueFrom(
      this.getPokemonSpecies(limit, offset)
    );

    const pokemonPromises = speciesResponse.results.map(
      async (species: any) => {
        const speciesData: any = await firstValueFrom(
          this.getPokemonData(species.url)
        );
        const detailedPokemon = await firstValueFrom(
          this.http.get(speciesData.varieties[0].pokemon.url)
        );
        return {
          species_name: species.name,
          ...detailedPokemon,
        };
      }
    );
    this.types = await Promise.all(typePromises);
    this.pokemons = await Promise.all(pokemonPromises);
  }

  getPokemonData(url: string) {
    return this.http.get(url);
  }

  getTypeId(typeName: string) {
    const match = this.types.find((t) => t.name === typeName);
    return match ? match.id : null;
  }

  getTypeSprite(typeName: string) {
    const typeId = this.getTypeId(typeName);

    const type = this.types[typeId - 1];
    return type.sprites['generation-ix']['scarlet-violet']['name_icon'];
  }

  async handlePageEvent(pageEvent: PageEvent) {
    this.limit = pageEvent.pageSize;
    this.currentPage = pageEvent.pageIndex;
    this.offset = pageEvent.pageIndex * pageEvent.pageSize;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        limit: this.limit,
        page: this.currentPage,
      },
    });

    await this.getPokemonInfo(this.limit, this.offset);
    window.scrollTo(0, 0);
  }

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(async (params) => {
      this.limit = +params['limit'] || 12;
      this.currentPage = +params['page'] || 0;
      this.offset = this.currentPage * this.limit;
      await this.getPokemonInfo(this.limit, this.offset);
    });
  }
}
