import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './shared';
import { ForgetPasswordComponent } from './login/forget-password/forget-password.component';

const routes: Routes = [
  // { path: '', redirectTo: '/login', pathMatch: 'full' },
  // { path: 'login', component: LoginComponent },
  // { path: 'dashboard', component: DashboardComponent },
  { path: 'forgotpassword', component: ForgetPasswordComponent },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },//canActivate: [AuthGuard] 
  { path: '', loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule), canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
