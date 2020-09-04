import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import {ApiService} from '../../../services/api.service'
import { environment } from "src/environments/environment";

@Component({
	selector: 'app-add-user',
	templateUrl: './add-user.component.html',
	styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {

	staffRoute = false;
	staffType='';
	submitted = false
	id;
	fileData: File = null;
	imagePreviewUrl : any = null;
	imgUrl;

	createUserForm: FormGroup
	constructor(private activatedRoute: ActivatedRoute, private router: Router, private fb: FormBuilder,
		private toastr:ToastrManager,private api:ApiService) { 
			 this.imgUrl = environment.image_url 
		}

	ngOnInit() {
		this.createUserForm = this.fb.group({
			userName: ['', Validators.pattern('^[a-zA-Z \-\']+')], firstName: ['',Validators.required], 
			email: ['', Validators.required], address: ['', Validators.required],
			phoneNumber: ['', Validators.required], password: ['', Validators.required],
			companyName: ['', Validators.required], images:['']
		})
		this.activatedRoute.params.subscribe((params: Params) => {
			// this.staffRoute = params.staff == 'contractor' ? false : true;
			console.log(params,"Params");
			this.staffType = params.staff == 'contractor' ? 'contractor' : params.staff == 'staff' ? 'staff' :'manager' ;
			this.id =  params.id ? params.id : ''
			this.id ? this.createUserForm.controls.password.disable() : ''
		})
		if(this.id){
			this.getEditList();
		}
	}
	restrictSpace(event){
		if(!event.target.value){
			event.target.value == "" && event.which == 32 ? event.preventDefault() : ''
		}
	  }

	getEditList(){
		// let role = this.staffRoute ? "staff" : "contractor"
		let role = this.staffType;
		this.api.get('users/list?'+"userId="+this.id+"&role="+role).subscribe(resp => {
			if(resp && resp.status == "200" && resp.data && resp.data.rows){
				let respData = resp.data.rows[0];
				// this.name = respData.userName;
				this.createUserForm = this.fb.group({
					userName: [respData.userName, Validators.required],firstName: [respData.firstName, Validators.required], email: [respData.email, Validators.required], 
					address: [respData.address, Validators.required],phoneNumber: [respData.mobile, Validators.required], 
					password: [respData.password.substring(0, 8), Validators.required],companyName: [respData.companyName, Validators.required],images:[respData.imageName]
				})
				this.imagePreviewUrl =this.imgUrl+'/users/'+respData.imageName
			}
		},err => {
			this.toastr.errorToastr(err.error.message);
		})
		}

	listPath() {
		// this.staffRoute ? this.router.navigateByUrl('/user/staff?back=true') : this.router.navigateByUrl('/user/contractor?back=true');
		this.staffType  == "contractor" ? this.router.navigateByUrl('/user/contractor?back=true')  : this.staffType  == "staff" ? this.router.navigateByUrl('/user/staff?back=true')  : this.router.navigateByUrl('/user/manager?back=true') ;

	}
	get f() {
		return this.createUserForm.controls
	}

	fileProgress(fileInput: any) {
		this.fileData = <File>fileInput.target.files[0];		

		var mimeType = this.fileData.type;
		if (mimeType.match(/image\/*/) == null) {
		  return;
		}
		var reader = new FileReader();
		reader.readAsDataURL(this.fileData);
		reader.onload = (_event) => {
		  this.imagePreviewUrl = reader.result;
		  this.createUserForm.value.images = '';
		}
	  }

	onSubmit() {
		this.submitted = true
		let formValues = this.createUserForm.value
		if (formValues.userName && formValues.address && formValues.email && formValues.phoneNumber && 
			formValues.password && formValues.companyName && (formValues.images || this.fileData) && this.createUserForm.valid) {

			let params = {
				"userId" : this.id,
				"userName" : formValues.userName,
				"firstName" : formValues.firstName.match(/[a-z]/) ? formValues.firstName : null,
				"email" : formValues.email.toLowerCase(),
				"address" : formValues.address.trim(),  				  
				"mobile" : formValues.phoneNumber,
				"companyName" : formValues.companyName,
				"role" :  this.staffType
			}
			if(!this.id){
				params['password'] = formValues.password
			}

			let paramsData = new FormData();
			if(this.createUserForm.value.images){
				paramsData.append("images", formValues.images);
			}else{
				paramsData.append("images", this.fileData);
			}
			
			paramsData.append("userData", JSON.stringify(params));
			this.api.mulipartPost('users/create',paramsData).subscribe(resp => {
				if(resp && resp.status == "200"){
					this.toastr.successToastr(resp.message);
					// this.staffRoute ? this.router.navigateByUrl('/user/staff?back=true') : this.router.navigateByUrl('/user/contractor?back=true')
					this.listPath();
				}				
			}, err => {
				err.error.errors[0].path == 'firstName' ? this.toastr.errorToastr('Name must be required') : err.error.errors[0].path == 'email' ? this.toastr.errorToastr(err.error.errors[0].message) :
				this.toastr.errorToastr('Mandatory fields are missing');
			})

		}else{
			this.toastr.errorToastr("Mandatory Fields are Missing or Invalid");
		}
	}
}