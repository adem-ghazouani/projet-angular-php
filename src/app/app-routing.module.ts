import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserLoginComponent } from './login/user-login.component';
import { UserRegisterComponent } from './register/user-register.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: UserLoginComponent },
  { path: 'register', component: UserRegisterComponent },
  { path: 'validation', redirectTo: 'admin-dashboard/validation', pathMatch: 'full' },
  { path: 'liste-utilisateur', redirectTo: 'admin-dashboard/utilisateurs', pathMatch: 'full' },
  { path: 'liste-utilisateur/ajouter', redirectTo: 'admin-dashboard/utilisateurs/ajouter', pathMatch: 'full' },
  {
    path: 'liste-utilisateur/modifier/:id',
    redirectTo: 'admin-dashboard/utilisateurs/modifier/:id'
  },
  { path: 'admin-stats', redirectTo: 'admin-dashboard/statistiques', pathMatch: 'full' },
  {
    path: 'admin-dashboard',
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
    loadChildren: () =>
      import('./admin-dashboard/admin-dashboard.module').then((m) => m.AdminDashboardModule)
  },
  {
    path: 'enseignant-dashboard',
    canActivate: [AuthGuard],
    data: { roles: ['enseignant'] },
    loadChildren: () =>
      import('./enseignant-dashboard/enseignant-dashboard.module').then(
        (m) => m.EnseignantDashboardModule
      )
  },
  {
    path: 'etudiant-dashboard',
    canActivate: [AuthGuard],
    data: { roles: ['etudiant'] },
    loadChildren: () =>
      import('./etudiant-dashboard/etudiant-dashboard.module').then(
        (m) => m.EtudiantDashboardModule
      )
  },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
