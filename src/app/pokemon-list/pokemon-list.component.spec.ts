import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withFetch } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { vi } from "vitest";

import { PokemonListComponent } from "./pokemon-list.component";
import { PokemonSpeciesList } from "../_core/models/pokemon";

describe("PokemonListComponent", () => {
  let fixture: ComponentFixture<PokemonListComponent>;
  let component: PokemonListComponent;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonListComponent],
      providers: [
        provideRouter([]),
        // real client + testing controller combo (Angular 17+ pattern)
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);

    // IMPORTANT: do NOT autoDetect; we want to control detectChanges timing
    // fixture.autoDetectChanges();

    // Set inputs BEFORE first detectChanges so initial fetch uses them
    fixture.componentRef.setInput("page", 2);
    fixture.componentRef.setInput("limit", 12);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should compute offset correctly", () => {
    expect(component.offset()).toBe(24);
  });

  it("should trigger navigation on page change", () => {
    const navigateSpy = vi.spyOn(router, "navigate");
    const mockEvent = { pageIndex: 3, pageSize: 24 } as any;

    component.onPageChanged(mockEvent);

    expect(navigateSpy).toHaveBeenCalledWith([], {
      queryParams: { page: 3, limit: 24 },
      queryParamsHandling: "merge",
    });
  });

  it("should render paginated Pokémon cards from allPokemons", async () => {
    fixture.componentRef.setInput("page", 0);
    fixture.componentRef.setInput("limit", 12);

    fixture.detectChanges();

    const req = httpMock.expectOne(
      (r) =>
        r.url.startsWith("https://pokeapi.co/api/v2/pokemon-species") &&
        r.params.get("offset") === "0" &&
        r.params.get("limit") === "12"
    );
    req.flush({
      results: [
        {
          name: "bulbasaur",
          url: "https://pokeapi.co/api/v2/pokemon-species/1/",
        },
        {
          name: "ivysaur",
          url: "https://pokeapi.co/api/v2/pokemon-species/2/",
        },
        {
          name: "venusaur",
          url: "https://pokeapi.co/api/v2/pokemon-species/3/",
        },
      ],
      count: 3,
      next: null,
      previous: null,
    });

    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent!.toLowerCase()).toContain("bulbasaur");
    expect(el.textContent!.toLowerCase()).toContain("ivysaur");
    expect(el.textContent!.toLowerCase()).toContain("venusaur");
  });
});
