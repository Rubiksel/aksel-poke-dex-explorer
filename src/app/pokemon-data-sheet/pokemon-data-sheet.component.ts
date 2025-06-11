import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-pokemon-data-sheet',
  imports: [CommonModule, RouterModule, FormsModule],
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
  selectedForm: any = null;
  selectedVersion: string = '';
  availableVersions: string[] = [];

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
    this.latestCry = this.pokemonVarieties[0].cries.latest;
    this.legacyCry = this.pokemonVarieties[0].cries.legacy;
    this.types = await Promise.all(typePromises);
    this.pokemonData = speciesData;
    this.previousPokemon = previousPokemon;
    this.nextPokemon = nextPokemon;
    this.selectedForm = this.pokemonVarieties[0];

    this.availableVersions = this.extractAvailableVersions(
      this.selectedForm.sprites.versions
    );
    this.selectedVersion = this.availableVersions[0] || '';
  }

  extractAvailableVersions(versionsObj: any): string[] {
    const versionList: string[] = [];

    for (const genKey of Object.keys(versionsObj)) {
      const generation = versionsObj[genKey];

      for (const versionKey of Object.keys(generation)) {
        if (versionKey !== 'icons') {
          if (
            versionKey === 'black-white' &&
            (this.pokemonId > 649 ||
              this.selectedForm.id > 10025 ||
              this.selectedForm.name.includes('mega'))
          ) {
            continue;
          }
          const spriteObj = generation[versionKey];

          const values = [
            ...Object.values(spriteObj || {}),
            ...(spriteObj?.animated ? Object.values(spriteObj.animated) : []),
          ];

          const hasNonNull = values.some((val) => val !== null);

          if (hasNonNull) {
            versionList.push(versionKey);
          }
        }
      }
    }

    return versionList;
  }

  getVersionedSpriteUrl() {
    const versions = this.selectedForm.sprites.versions;

    for (const genKey of Object.keys(versions)) {
      const generation = versions[genKey];
      const versionData = generation[this.selectedVersion];

      if (versionData) {
        const animated = versionData.animated || {};
        return {
          front_default:
            animated.front_default || versionData.front_default || null,
        };
      }
    }
    return {
      front_default: this.selectedForm.sprites.front_default || null,
    };
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
    if (!typeId) {
      return undefined;
    }
    const type = this.types[typeId - 1];
    return type.sprites['generation-ix']['scarlet-violet']['name_icon'];
  }

  formatFormName(name: string) {
    const parts = name.split('-');
    const baseName = parts[0];
    const suffixes = parts.slice(1);

    let formName = '';

    for (let part of suffixes) {
      switch (part.toLowerCase()) {
        case 'mega':
          formName += 'Mega ';
          break;
        case 'primal':
          formName += 'Primal ';
          break;
        case 'gmax':
          formName += 'Gigantamax ';
          break;
        case 'alola':
          formName += 'Alolan ';
          break;
        case 'hisui':
          formName += 'Hisuian ';
          break;
        case 'galar':
          formName += 'Galarian ';
          break;
        case 'paldea':
          formName += 'Paldean ';
          break;
        default:
          formName += part + ' ';
      }
    }

    return (formName.trim() + ' ' + baseName).trim();
  }

  convertHeight(height: number) {
    const inchesTotal = height * 3.93701;
    const feet = Math.floor(inchesTotal / 12);
    const inches = parseFloat((inchesTotal % 12).toFixed(0));
    return `${feet}' ${inches}"`;
  }

  convertWeight(weight: number) {
    return `${parseFloat((weight * 0.220462).toFixed(1))} lbs`;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(async (params) => {
      this.pokemonId = Number(params.get('id'));
      await this.getPokemonInfo();
    });
  }

  onFormChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const formName = selectElement.value;
    const form = this.pokemonVarieties.find((f) => f.name === formName);
    if (form) {
      this.selectedForm = form;
      this.latestCry = form.cries.latest;
      this.legacyCry = form.cries.legacy;
      this.availableVersions = this.extractAvailableVersions(
        this.selectedForm.sprites.versions
      );
      console.log(this.availableVersions);
      if (!this.availableVersions.includes(this.selectedVersion)) {
        this.selectedVersion = this.availableVersions[0];
      }
    }
  }
}
