import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {ApiService} from '../services/api.service'
import { RESPONSE } from '../config/Response';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email;
	password;
	forgetPassword = false;
	submitted = false;
	authForm: FormGroup;
	response = RESPONSE;
	constructor(
		public router: Router,
		private api : ApiService,
		private fb: FormBuilder,
		public toastr: ToastrManager) { }

	ngOnInit() {
		this.authForm = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required]]
		});
		localStorage.clear();
	}
	get f() { return this.authForm.controls; }
	
	onLoggedin() { 
			this.submitted = true;
			const credentials = this.authForm.value;
			if (credentials.email && credentials.password.length && this.authForm.valid) {
				let params = {
					"email": credentials.email,
					"password": credentials.password,
					"type":"web"
				}
				this.api.post('auth/login',JSON.stringify(params)).subscribe(resp => {
					if (resp && resp.status) {
						this.toastr.successToastr(resp.message);
						localStorage.setItem('token', resp.token);
						localStorage.setItem('isLoggedin', 'true');
						localStorage.setItem('userId', resp.data.id);						
						this.router.navigateByUrl('/dashboard');
					}
				}, err => {
					console.log(err)
					this.toastr.errorToastr(err.error.message);
				})
			}
			else {
				credentials.email && !credentials.password ? this.toastr.errorToastr('Password is required') : 
				!credentials.email && credentials.password ? this.toastr.errorToastr('Email is required') : 
				!credentials.email && !credentials.password ? this.toastr.errorToastr('Mandatory field are missing') : ''
			}
		}
}