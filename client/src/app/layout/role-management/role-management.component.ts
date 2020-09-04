import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-role-management',
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss']
})
export class RoleManagementComponent implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {
  }
  addPath(){
    this.router.navigateByUrl('/role-management/add')
  }

}
