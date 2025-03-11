import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChillarGuard } from './chillar.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';


const routes: Routes = [
  {path: '', redirectTo: '/Login', pathMatch: 'full'},
  {path: 'Login', component: LoginComponent},
  {path: 'dashboard', component: DashboardComponent, canActivate : [ChillarGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
