import { NgModule } from '@angular/core';
import { Routes, RouterModule, } from '@angular/router';
import { EmailDetailsComponent } from './pages/email-details/email-details.component';
import { EmailListComponent } from './pages/email-list/email-list.component';
import { HomeComponent } from './pages/home/home.component';
import { EmailAppComponent } from './pages/email-app/email-app.component';
import { EmailResolver } from './services/email.resolver';
import { LoginComponent } from './pages/login/login.component';
// import { TabResolver } from './services/tab.resolver';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  
  {
    path: 'email', component: EmailAppComponent, children: [
      { path: '', redirectTo: 'inbox', pathMatch: 'full' },
      { path: 'label/:labelName/:id', component: EmailDetailsComponent,resolve: { email: EmailResolver } },
      { path: 'label/:labelName', component: EmailListComponent },
      { path: ':tab', component: EmailListComponent}, //resolve: { tab: TabResolver } },
      { path: ':tab/:id', component: EmailDetailsComponent, resolve: { email: EmailResolver } },
    ]
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true, // Usa hash en URLs (#/ruta) - opcional
    scrollPositionRestoration: 'enabled', // Restaura el scroll al navegar
    anchorScrolling: 'enabled' // Habilita el scroll en anclas (#id)
  })],
  exports: [RouterModule],
})
export class AppRoutingModule { }

