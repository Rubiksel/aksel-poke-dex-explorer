import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-pokemon-data-sheet',
  imports: [CommonModule, RouterModule],
  templateUrl: './pokemon-data-sheet.component.html',
  styleUrl: './pokemon-data-sheet.component.css',
})
export class PokemonDataSheetComponent {
  pokemonId!: any;
  pokemonData: any;
  pokemonVarieties: any[] = [];
  previousPokemon: any;
  nextPokemon: any;
  latestCry = '';
  legacyCry = '';
  types: any[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  getTypes() {
    return this.http.get(`https://pokeapi.co/api/v2/type`);
  }

  getTypeData(url: string) {
    return this.http.get(`${url}`);
  }

  getPreviousPokemon() {
    return this.http.get(
      `https://pokeapi.co/api/v2/pokemon/${this.pokemonId - 1}`
    );
  }

  getNextPokemon() {
    return this.http.get(
      `https://pokeapi.co/api/v2/pokemon/${this.pokemonId + 1}`
    );
  }

  getPokemonSpecies() {
    return this.http.get(
      `https://pokeapi.co/api/v2/pokemon-species/${this.pokemonId}`
    );
  }

  async getPokemonInfo() {
    this.pokemonVarieties = [];
    let previousPokemon: any;
    let nextPokemon: any;

    const typeResponse: any = await firstValueFrom(this.getTypes());
    const typePromises = typeResponse.results.map((result: any) =>
      firstValueFrom(this.getTypeData(result.url))
    );

    const speciesData: any = await firstValueFrom(this.getPokemonSpecies());

    if (this.pokemonId - 1 > 0) {
      previousPokemon = await firstValueFrom(this.getPreviousPokemon());
    }
    if (this.pokemonId + 1 < 1026) {
      nextPokemon = await firstValueFrom(this.getNextPokemon());
    }

    for (let i = 0; i < speciesData.varieties.length; i++) {
      this.pokemonVarieties[i] = await firstValueFrom(
        this.getPokemonData(speciesData.varieties[i].pokemon.url)
      );
    }

    console.log('VAR', this.pokemonVarieties[0]);

    this.latestCry = this.pokemonVarieties[0].cries.latest;
    this.legacyCry = this.pokemonVarieties[0].cries.legacy;
    this.types = await Promise.all(typePromises);
    this.pokemonData = speciesData;
    this.previousPokemon = previousPokemon;
    this.nextPokemon = nextPokemon;

    console.log(this.latestCry);
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

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.pokemonId = Number(params.get('id'));
      this.getPokemonInfo();
    });
  }
}
