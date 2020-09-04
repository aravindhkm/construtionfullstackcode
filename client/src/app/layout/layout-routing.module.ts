import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component'
import {UserComponent} from './user/user.component'
import {ProjectComponent} from './project/project.component'
import { ProjectDocumentsComponent } from './project-documents/project-documents.component';
import { WorkMonitoringComponent } from './work-monitoring/work-monitoring.component';
import { TodosComponent } from './todos/todos.component';
// import { TodosComponent } from './todos/todos.component';
import {InspectionReportComponent} from './inspection-report/inspection-report.component';
import { IssuesComponent } from './issues/issues.component';
import {ConditionComponent} from './condition/condition.component'
import {SettingsComponent} from './settings/settings.component'
import {RoleManagementComponent} from './role-management/role-management.component'


const routes: Routes = [
  { path : '', redirectTo: 'dashboard', pathMatch: 'prefix'},
  { path : 'user/:staff', component : UserComponent},
  { path : 'user/:contractor', component : UserComponent},
  { path : 'user/:manager', component : UserComponent},
  { path: 'survey/:condition', component : ConditionComponent},
  { path : 'survey/:precondition' , component : ConditionComponent},
  { path : 'project', component : ProjectComponent},
  { path : 'dashboard', component : DashboardComponent},
  // { path: 'document', component : ProjectDocumentsComponent},
  // { path: 'documents/:soi', component : ProjectDocumentsComponent},
  // { path: 'documents/:tds', component : ProjectDocumentsComponent},
  // { path: 'documents/:claims', component : ProjectDocumentsComponent},
  // { path: 'work-monitor', component : WorkMonitoringComponent },
  { path: 'todo', component : TodosComponent },
  // { path: 'inspection-report', component : InspectionReportComponent },
  // { path: 'issues', component : IssuesComponent },
  { path: 'settings', component : SettingsComponent },
  // { path: 'role-management', component : RoleManagementComponent },
  { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
