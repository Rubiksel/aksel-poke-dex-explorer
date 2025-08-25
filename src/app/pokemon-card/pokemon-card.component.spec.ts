import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PokemonCardComponent } from './pokemon-card.component';

describe('PokemonCardComponent', () => {
  let fixture: ComponentFixture<PokemonCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonCardComponent],
      providers: [provideRouter([])], // if template uses routerLink
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonCardComponent);

    const spriteStub = {
      front_default: 'about:blank',
      other: {
        'official-artwork': {
          front_default: 'about:blank',
        },
      },
    };

    const pikachuMinimal = {
      id: 25,
      name: 'pikachu',
      sprites: spriteStub,
      types: [],
      abilities: [],
    } as any;

    // set ALL required inputs before detectChanges
    fixture.componentRef.setInput('pokemon', pikachuMinimal);
    fixture.componentRef.setInput('basePokemon', pikachuMinimal);
    fixture.componentRef.setInput('pokemonSpecies', {
      name: 'pikachu',
      is_legendary: false,
      varieties: [{ pokemon: { name: 'pikachu' } }],
    } as any);
    fixture.componentRef.setInput('selectedForm', 'pikachu');

    // optional inputs if template touches them
    fixture.componentRef.setInput('flavorText', '');
    fixture.componentRef.setInput('latestCry', undefined);
    fixture.componentRef.setInput('legacyCry', undefined);
    fixture.componentRef.setInput('previousSpecies', { name: 'arbok' } as any);
    fixture.componentRef.setInput('previousPokemon', { sprites: spriteStub } as any);
    fixture.componentRef.setInput('nextSpecies', { name: 'raichu' } as any);
    fixture.componentRef.setInput('nextPokemon', { sprites: spriteStub } as any);
    fixture.componentRef.setInput('height', '');
    fixture.componentRef.setInput('weight', '');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
