
import { AddInspectionComponent } from './add-inspection/add-inspection.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  // { path : 'inspection-report/view/:projectId', component : AddInspectionComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InspectionReportRoutingModule { }
