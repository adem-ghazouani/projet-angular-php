import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserLoginComponent } from './login/user-login.component';
import { UserRegisterComponent } from './register/user-register.component';
import { HomeComponent } from './home/home.component';
import { UserValidationComponent } from './validation-compte/validation-compte.component';
import { JwtInterceptor } from './jwt.interceptor';
import { ListeUtilisateurComponent } from './liste-utilisateur/liste-utilisateur.component';
import { AdminStatsComponent } from './admin-stats/admin-stats.component';

@NgModule({
  declarations: [
    AppComponent,
    UserLoginComponent,
    UserRegisterComponent,
    HomeComponent,
    UserValidationComponent,
    ListeUtilisateurComponent,
    AdminStatsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
