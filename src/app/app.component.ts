import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './service/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  currentYear: number;
  isDashboardRoute = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.currentYear = new Date().getFullYear();
    this.updateLayoutVisibility(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateLayoutVisibility((event as NavigationEnd).urlAfterRedirects);
      });
  }

  private updateLayoutVisibility(url: string): void {
    this.isDashboardRoute =
      url.startsWith('/admin-dashboard') ||
      url.startsWith('/enseignant-dashboard') ||
      url.startsWith('/etudiant-dashboard');
  }
}
