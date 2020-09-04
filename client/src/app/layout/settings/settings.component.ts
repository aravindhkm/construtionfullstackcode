import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { RESPONSE } from '../../config/Response';
import {ApiService} from '../../services/api.service'
import { ToastrManager } from 'ng6-toastr-notifications';
import { Location } from '@angular/common';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  password;
  cpassword;
  submitted = false;
  status = false;
  settingsId;
  authForm: FormGroup;

  constructor(
		public router: Router,
		private api : ApiService,
		private fb: FormBuilder,
		public toastr: ToastrManager,
		private location: Location) { }

	ngOnInit(): void {
		this.authForm = this.fb.group({
			password: ['', [Validators.required]],
			cpassword: ['', [Validators.required]],
		});
		this.getSettingsList();
  }

  get f() {
	return this.authForm.controls
}

  getSettingsList(){
	this.api.get('shared/getSettings').subscribe(resp=>{
		if(resp && resp.data){
			let respData = resp.data[1];
			this.status = respData.status
			this.settingsId = resp.data[0].id
		}
	})
  }
  
  onValueChange(value: boolean) {	
	let bodyData = {settingId:this.settingsId, status:value}
	this.api.post('shared/updateSettings', bodyData).subscribe(resp => {
		if(resp && resp.status =="200"){
			this.status = value;
			this.toastr.successToastr(resp.message)
		}
	})
  }

  listPath(){
	  this.location.back()
  }

  onLoggedin() {
		this.submitted = true;
		const credentials = this.authForm.value;
		if (credentials.password.length >= 6 && credentials.cpassword.length >= 6 && this.authForm.valid) {
			if (credentials.password == credentials.cpassword) {
				let params = {
					password:credentials.cpassword,
					userId : localStorage.getItem("userId")
				}
				let paramsData = new FormData();
				paramsData.append("userData", JSON.stringify(params));
				this.api.mulipartPost('users/create',paramsData).subscribe(resp => {
					if(resp && resp.status){
						this.toastr.successToastr(resp.message);
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
