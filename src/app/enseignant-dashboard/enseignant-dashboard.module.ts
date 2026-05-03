import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { EnseignantDashboardComponent } from './enseignant-dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EnseignantDemandesPageComponent } from './pages/enseignant-demandes-page/enseignant-demandes-page.component';
import { EnseignantRapportsPageComponent } from './pages/enseignant-rapports-page/enseignant-rapports-page.component';
import { EnseignantEvaluationsPageComponent } from './pages/enseignant-evaluations-page/enseignant-evaluations-page.component';
import { EnseignantAccueilPageComponent } from './pages/enseignant-accueil-page/enseignant-accueil-page.component';

const routes: Routes = [
  {
    path: '',
    component: EnseignantDashboardComponent,
    children: [
      { path: '', redirectTo: 'accueil', pathMatch: 'full' },
      { path: 'accueil', component: EnseignantAccueilPageComponent },
      { path: 'demandes', component: EnseignantDemandesPageComponent },
      { path: 'rapports', component: EnseignantRapportsPageComponent },
      { path: 'evaluations', component: EnseignantEvaluationsPageComponent }
    ]
  }
];

@NgModule({
  declarations: [
    EnseignantDashboardComponent,
    EnseignantAccueilPageComponent,
    EnseignantDemandesPageComponent,
    EnseignantRapportsPageComponent,
    EnseignantEvaluationsPageComponent
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class EnseignantDashboardModule {}
