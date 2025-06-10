import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonDataSheetComponent } from './pokemon-data-sheet.component';

describe('PokemonDataSheetComponent', () => {
  let component: PokemonDataSheetComponent;
  let fixture: ComponentFixture<PokemonDataSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonDataSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonDataSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
