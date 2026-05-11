import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  pendingNavCount = 0;

  private navSub?: Subscription;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshPendingCount();
    this.navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.refreshPendingCount());
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  refreshPendingCount(): void {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        const raw = this.extractArray(res);
        this.pendingNavCount = raw.filter((r: any) => {
          const s = String(r?.status ?? '').toLowerCase().trim();
          return s === 'pending';
        }).length;
      },
      error: () => {
        this.pendingNavCount = 0;
      }
    });
  }

  private extractArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.users)) return res.users;
    if (Array.isArray(res?.data)) return res.data;
    const found = Object.values(res ?? {}).find((v) => Array.isArray(v));
    return Array.isArray(found) ? (found as any[]) : [];
  }

  logout(): void {
    this.authService.logout();
  }
}
