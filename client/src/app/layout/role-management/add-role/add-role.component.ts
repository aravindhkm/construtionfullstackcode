import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss']
})
export class AddRoleComponent implements OnInit {

  createRoleForm:FormGroup
  moduleArray=[]
  constructor(private fb:FormBuilder,private router:Router) { }

  ngOnInit() {
    this.moduleArray=[{name:'Staff Management',write:false,read:false},{name:'Contractor Management',write:false,read:false},{name:'Role Management',write:false,read:false},{name:'Project Management',write:false,read:false},
    {name:'Project Document Management',write:false,read:false},{name:'Work Monitoring Report Management',write:false,read:false},{name:'Inspection Report Management',write:false,read:false},{name:'Condition Survey Management',write:false,read:false},{name:'Pre Condition Survey Management',write:false,read:false},{name:'Todos Management',write:false,read:false},{name:'Issue Management',write:false,read:false}]
      this.createRoleForm=this.fb.group({role:['',[Validators.required]],})
  }
  onCheckBoxChange(event,index,type){
  }
  listPath(){
    this.router.navigateByUrl('/role-management')
  }
  onSubmit(){

  }
}
