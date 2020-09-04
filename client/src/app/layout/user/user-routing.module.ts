
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddUserComponent } from './add-user/add-user.component';


const routes: Routes = [
  { path : 'user/:staff/add', component : AddUserComponent},
  {path : 'user/:staff/edit/:id',component:AddUserComponent},
  { path : 'user/:contractor/add', component : AddUserComponent},
  {path : 'user/:contractor/edit/:id',component:AddUserComponent},
  { path : 'user/:manager/add', component : AddUserComponent},
  {path : 'user/:manager/edit/:id',component:AddUserComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
 