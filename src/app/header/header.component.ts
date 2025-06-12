import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  selectedLanguage: string = 'en';

  constructor(private router: Router, private route: ActivatedRoute) {}

  onLanguageChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const lang = selectElement.value;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { lang },
      queryParamsHandling: 'merge',
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.selectedLanguage = params['lang'] || 'en';
    });
  }
}
