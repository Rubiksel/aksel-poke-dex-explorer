import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  selectedLanguage: string = 'en';
  translatedName: string = '';
  translatedAbilites: { names: string[]; is_hidden: boolean }[] = [];
  flavorText: string = '';

  versionKeyToGameVersions: Record<string, string[]> = {
    'red-blue': ['red', 'blue'],
    yellow: ['yellow'],
    'gold-silver': ['gold', 'silver'],
    crystal: ['crystal'],
    'ruby-sapphire': ['ruby', 'sapphire'],
    emerald: ['emerald'],
    'firered-leafgreen': ['firered', 'leafgreen'],
    'diamond-pearl': ['diamond', 'pearl'],
    platinum: ['platinum'],
    'heartgold-soulsilver': ['heartgold', 'soulsilver'],
    'black-white': ['black', 'white'],
    'black-2-white-2': ['black-2', 'white-2'],
    'x-y': ['x', 'y'],
    'omega-ruby-alpha-sapphire': ['omega-ruby', 'alpha-sapphire'],
    'sun-moon': ['sun', 'moon'],
    'ultra-sun-ultra-moon': ['ultra-sun', 'ultra-moon'],
    'lets-go-pikachu-lets-go-eevee': ['lets-go-pikachu', 'lets-go-eevee'],
    'sword-shield': ['sword', 'shield'],
    'brilliant-diamond-shining-pearl': ['brilliant-diamond', 'shining-pearl'],
    'legends-arceus': ['legends-arceus'],
    'scarlet-violet': ['scarlet', 'violet'],
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

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

    this.translatedName = this.pokemonData.names.find(
      (n: any) => n.language.name === this.selectedLanguage
    ).name;

    this.translatedAbilites = await Promise.all(
      this.selectedForm.abilities.map(async (abilityObj: any) => {
        const abilityData: any = await firstValueFrom(
          this.getAbilityData(abilityObj.ability.url)
        );
        return {
          names: abilityData.names,
        };
      })
    );

    this.flavorText = this.getTranslatedFlavorText(
      speciesData.flavor_text_entries,
      this.selectedLanguage,
      this.selectedVersion
    );
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

  getAbilityData(url: string) {
    return this.http.get(url);
  }

  getAbilityName(ability: any): string {
    return (
      ability.names.find((n: any) => n.language.name === this.selectedLanguage)
        ?.name ||
      ability.names.find((n: any) => n.language.name === 'en')?.name ||
      'Unknown'
    );
  }

  getTranslatedFlavorText(
    entries: any[],
    language: string,
    spriteVersionKey: string
  ) {
    const actualVersions =
      this.versionKeyToGameVersions[spriteVersionKey] || [];

    for (let version of actualVersions) {
      const match = entries.find(
        (entry) =>
          entry.language.name === language && entry.version.name === version
      );
      if (match) {
        return this.cleanFlavorText(match.flavor_text);
      }
    }

    const fallback = entries.find((entry) => entry.language.name === language);
    return fallback
      ? this.cleanFlavorText(fallback.flavor_text)
      : 'No description available.';
  }

  cleanFlavorText(text: string) {
    return text.replace(/[\f\n\r]/g, ' ').trim();
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

  getFlavorText() {
    return this.getTranslatedFlavorText(
      this.pokemonData.flavor_text_entries,
      this.selectedLanguage,
      this.selectedVersion
    );
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
    if (this.selectedLanguage === 'en') {
      const inchesTotal = height * 3.93701;
      const feet = Math.floor(inchesTotal / 12);
      const inches = parseFloat((inchesTotal % 12).toFixed(0));
      return `Height: ${feet}' ${inches}"`;
    }
    return `Taille : ${height / 10} m`;
  }

  convertWeight(weight: number) {
    if (this.selectedLanguage === 'en') {
      return `Weight: ${parseFloat((weight * 0.220462).toFixed(1))} lbs`;
    }
    return `Masse : ${weight / 10} kg`;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(async (params) => {
      this.pokemonId = Number(params.get('id'));

      await this.getPokemonInfo();
    });
    this.route.queryParams.subscribe(async (queryParams) => {
      const newLang = queryParams['lang'] || 'en';

      if (newLang !== this.selectedLanguage) {
        this.selectedLanguage = newLang;
        await this.getPokemonInfo();
      }
    });
  }

  async onFormChange(event: Event) {
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
      if (!this.availableVersions.includes(this.selectedVersion)) {
        this.selectedVersion = this.availableVersions[0];
      }
      this.translatedAbilites = await Promise.all(
        this.selectedForm.abilities.map(async (abilityObj: any) => {
          const abilityData: any = await firstValueFrom(
            this.getAbilityData(abilityObj.ability.url)
          );
          return {
            names: abilityData.names,
          };
        })
      );
      this.flavorText = this.getTranslatedFlavorText(
        this.pokemonData.flavor_text_entries,
        this.selectedLanguage,
        this.selectedVersion
      );
    }
  }

  async handleLanguageChange(newLang: string) {
    if (newLang === this.selectedLanguage) {
      return;
    }

    this.selectedLanguage = newLang;

    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { lang: newLang },
      queryParamsHandling: 'merge',
    });

    this.flavorText = this.getTranslatedFlavorText(
      this.pokemonData.flavor_text_entries,
      this.selectedLanguage,
      this.selectedVersion
    );
  }
}
