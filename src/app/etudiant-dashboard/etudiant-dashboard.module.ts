import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { EtudiantDashboardComponent } from './etudiant-dashboard.component';
import { FormsModule } from '@angular/forms';
import { EtudiantDemandePageComponent } from './pages/etudiant-demande-page/etudiant-demande-page.component';
import { EtudiantRapportPageComponent } from './pages/etudiant-rapport-page/etudiant-rapport-page.component';
import { EtudiantResultatsPageComponent } from './pages/etudiant-resultats-page/etudiant-resultats-page.component';

const routes: Routes = [
  {
    path: '',
    component: EtudiantDashboardComponent,
    children: [
      { path: '', redirectTo: 'accueil', pathMatch: 'full' },
      { path: 'accueil', component: EtudiantResultatsPageComponent },
      { path: 'demande', component: EtudiantDemandePageComponent },
      { path: 'rapport', component: EtudiantRapportPageComponent },
      { path: 'resultats', component: EtudiantResultatsPageComponent }
    ]
  }
];

@NgModule({
  declarations: [
    EtudiantDashboardComponent,
    EtudiantDemandePageComponent,
    EtudiantRapportPageComponent,
    EtudiantResultatsPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class EtudiantDashboardModule {}
