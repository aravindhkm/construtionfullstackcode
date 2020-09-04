import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { TranslateModule } from '@ngx-translate/core';
// import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
// import { ToastrModule, ToastContainerModule} from 'ngx-toastr';
// import { BrowserModule } from '@angular/platform-browser';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    imports: [
        CommonModule,
        FormsModule, 
        ReactiveFormsModule,
        // TranslateModule,
        LoginRoutingModule,
        // ToastrModule.forRoot({ positionClass: 'inline' }),
        // ToastContainerModule,
        // BrowserModule,
        // BrowserAnimationsModule
    ],
    declarations: [LoginComponent, ForgetPasswordComponent]
})
export class LoginModule {}
