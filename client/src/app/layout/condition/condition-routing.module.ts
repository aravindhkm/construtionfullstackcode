import { ViewConditionComponent } from './view-condition/view-condition.component';
import { ViewPreConditionComponent } from './view-pre-condition/view-pre-condition.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path : "survey/condition/view/:id" , component : ViewConditionComponent},
  { path : "survey/precondition/view/:id" , component : ViewPreConditionComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConditionRoutingModule { }
