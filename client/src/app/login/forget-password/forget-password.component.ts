import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { RESPONSE } from '../../config/Response';
import {ApiService} from '../../services/api.service'
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
	selector: 'app-forget-password',
	templateUrl: './forget-password.component.html',
	styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {
	email;
	password;
	cpassword;
	otp;
	submitted = false;
	enableReset = false;
	authForm: FormGroup;
	response = RESPONSE;

	constructor(
		public router: Router,
		private api : ApiService,
		private fb: FormBuilder,
		public toastr: ToastrManager) { }

	ngOnInit(): void {
		this.authForm = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required]],
			cpassword: ['', [Validators.required]],
			otp: ['', [Validators.required]],
		});
	}

	get f() { return this.authForm.controls; }

	loginPath(){
		this.router.navigateByUrl('/login')
	}
	sendOtp() {	
		if (this.authForm && this.authForm.value && this.authForm.value.email) {
			let params = {
				email: this.authForm.value.email
			}
			localStorage.removeItem("token");
			this.api.post('auth/forgotPassword',JSON.stringify(params)).subscribe(resp => {
				if(resp && resp.status){
					this.toastr.successToastr(resp.message);
					this.authForm.controls['otp'].enable();
				}				
			}, err => {
				this.toastr.errorToastr(err.error.message);
			})
		} else {
			this.toastr.errorToastr("Please Enter Email");
		}
	}

		nextTab(){
			if (this.authForm.value.email && this.authForm.value.otp) {
				let params = {
					email: this.authForm.value.email,
					otp : this.authForm.value.otp
				}				
				this.api.post('auth/verifyOtp',JSON.stringify(params)).subscribe(resp => {
					if(resp && resp.status){
						this.toastr.successToastr(resp.message);
						this.enableReset = true;
					}
				}, err => {
					this.toastr.errorToastr(err.error.message);
				})
			} else {
				this.toastr.errorToastr("Please Enter Mandatory Fields");
			}
		}

	onLoggedin() {
		this.submitted = true;
		const credentials = this.authForm.value;
		if (credentials.email && credentials.password.length >= 6 && credentials.cpassword.length >= 6 && this.authForm.valid) {
			if (credentials.password == credentials.cpassword) {
				let params = {
					email: credentials.email,
					otp:credentials.otp,
					password:credentials.cpassword

				}
				this.api.post('auth/resetPassword',JSON.stringify(params)).subscribe(resp => {
					if(resp && resp.status){
						this.toastr.successToastr(resp.message);
						this.router.navigateByUrl('/login');
					}
				}, err => {
					this.toastr.errorToastr(err.error.message);
				})
			} else {
				this.toastr.errorToastr("Password Mismatch");
			}
		}
		else {
			credentials.cpassword.length && credentials.password.length <= 5 ?   this.toastr.errorToastr("Password must be minimum six characters") :  this.toastr.errorToastr("Please Enter mandatory fields");		
		}
	}
}