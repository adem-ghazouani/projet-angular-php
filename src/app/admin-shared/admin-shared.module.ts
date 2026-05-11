import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ListeUtilisateurComponent } from '../liste-utilisateur/liste-utilisateur.component';
import { AdminStatsComponent } from '../admin-stats/admin-stats.component';
import { UserValidationComponent } from '../validation-compte/validation-compte.component';

@NgModule({
  declarations: [ListeUtilisateurComponent, AdminStatsComponent, UserValidationComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  exports: [ListeUtilisateurComponent, AdminStatsComponent, UserValidationComponent]
})
export class AdminSharedModule {}
