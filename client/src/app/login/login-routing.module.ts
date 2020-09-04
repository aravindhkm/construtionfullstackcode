import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';
import {ForgetPasswordComponent} from './forget-password/forget-password.component'

const routes: Routes = [
    {
        path: '',
        component: LoginComponent
    },
    // {
    //     path: 'login',
    //     component: LoginComponent
    // },
    {
        path: 'forgotpassword',
        component: ForgetPasswordComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LoginRoutingModule {}
