import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminAccueilPageComponent } from './pages/admin-accueil-page/admin-accueil-page.component';
import { AdminListeUtilisateursPageComponent } from './pages/admin-liste-utilisateurs-page/admin-liste-utilisateurs-page.component';
import { AdminStatistiquesPageComponent } from './pages/admin-statistiques-page/admin-statistiques-page.component';
import { AdminValidationPageComponent } from './pages/admin-validation-page/admin-validation-page.component';
import { AdminSharedModule } from '../admin-shared/admin-shared.module';
import { ListeUtilisateurComponent } from '../liste-utilisateur/liste-utilisateur.component';
import { AdminStatsComponent } from '../admin-stats/admin-stats.component';
import { UserValidationComponent } from '../validation-compte/validation-compte.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    children: [
      { path: '', redirectTo: 'accueil', pathMatch: 'full' },
      { path: 'accueil', component: AdminAccueilPageComponent },
      { path: 'validation', component: UserValidationComponent },
      {
        path: 'utilisateurs',
        children: [
          { path: '', component: ListeUtilisateurComponent },
          { path: 'ajouter', component: ListeUtilisateurComponent },
          { path: 'modifier/:id', component: ListeUtilisateurComponent }
        ]
      },
      { path: 'statistiques', component: AdminStatsComponent }
    ]
  }
];

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminAccueilPageComponent,
    AdminListeUtilisateursPageComponent,
    AdminStatistiquesPageComponent,
    AdminValidationPageComponent
  ],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes), AdminSharedModule]
})
export class AdminDashboardModule {}
