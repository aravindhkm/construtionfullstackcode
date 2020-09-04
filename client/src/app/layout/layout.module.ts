import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { UserComponent} from './user/user.component';
import { AddUserComponent } from './user/add-user/add-user.component'
import { UserRoutingModule } from './user/user-routing.module';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbModule, NgbTab } from '@ng-bootstrap/ng-bootstrap';
import { ProjectComponent } from './project/project.component'
import {ProjectRoutingModule} from './project/project-routing.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ProjectDocumentsComponent } from './project-documents/project-documents.component';
import { AddProjectComponent } from './project/add-project/add-project.component';
import { AddDocumentsComponent } from './project-documents/add-documents/add-documents.component';
import {DashboardModule} from './dashboard/dashboard.module'
import {ProjectDocumentsRoutingModule} from './project-documents/project-documents-routing.module';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { AddCommondocumentComponent } from './project-documents/add-commondocument/add-commondocument.component';
import {NgxPaginationModule} from 'ngx-pagination'
import { AddworkMonitoringComponent } from './work-monitoring/addwork-monitoring/addwork-monitoring.component';
import { WorkMonitoringComponent } from './work-monitoring/work-monitoring.component';
import { WorkMonitoringRoutingModule } from './work-monitoring/work-monitoring-routing.module';
import { DropMonitoringComponent } from './work-monitoring/drop-monitoring/drop-monitoring.component';
import { ImageMonitoringComponent } from './work-monitoring/image-monitoring/image-monitoring.component';
import {CrystalLightboxModule} from '@crystalui/angular-lightbox';
import { TodosComponent } from './todos/todos.component';
import { AddTodosComponent } from './todos/add-todos/add-todos.component';
import { TodosRoutingModule } from './todos/todos-routing.module';
import { InspectionReportComponent } from './inspection-report/inspection-report.component';
import { AddInspectionComponent } from './inspection-report/add-inspection/add-inspection.component';
import {InspectionReportRoutingModule} from './inspection-report/inspection-report-routing.module';
import { AddIssuesComponent } from './issues/add-issues/add-issues.component';
import { IssuesComponent } from './issues/issues.component';
import { IssuesRoutingModule } from './issues/issues-routing.module';
import { ConditionComponent } from './condition/condition.component';
import { ViewConditionComponent } from './condition/view-condition/view-condition.component';
import { ViewPreConditionComponent } from './condition/view-pre-condition/view-pre-condition.component';
import {ConditionRoutingModule} from './condition/condition-routing.module';
import { SettingsComponent } from './settings/settings.component'
import {SettingsRoutingModule} from './settings/settings-routing.module'
import { UiSwitchModule } from 'ngx-ui-switch';
import { RoleManagementComponent } from './role-management/role-management.component';
import { RoleManagementRoutingModule} from './role-management/role-management-routing.module';
import { AddRoleComponent } from './role-management/add-role/add-role.component'
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG,PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
@NgModule({
  declarations: [
    LayoutComponent,
    UserComponent,
    AddUserComponent,
    ProjectComponent,
    AddProjectComponent,
    ProjectDocumentsComponent,
    AddDocumentsComponent,
    AddCommondocumentComponent,
    // NavbarComponent,
    // SidebarComponent, 
    WorkMonitoringComponent,
    AddworkMonitoringComponent,
    DropMonitoringComponent,
    ImageMonitoringComponent,
    TodosComponent,    
    AddTodosComponent,
    InspectionReportComponent,
    AddInspectionComponent,
    IssuesComponent,
    AddIssuesComponent,
    ConditionComponent,
    ViewConditionComponent,
    ViewPreConditionComponent,
    SettingsComponent,
    RoleManagementComponent,
    AddRoleComponent
    // TodosComponent,    
    // AddTodosComponent
  ],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    UserRoutingModule,
    ProjectRoutingModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    FormsModule,
    PerfectScrollbarModule,
    NgbModule,
    DashboardModule,
    ProjectDocumentsRoutingModule,
    NgMultiSelectDropDownModule.forRoot(),
    AngularMultiSelectModule,
    NgxPaginationModule,
    WorkMonitoringRoutingModule,
    CrystalLightboxModule,
    TodosRoutingModule,
    InspectionReportRoutingModule,
    ConditionRoutingModule,
    // DpDatePickerModule
    // TodosRoutingModule,
    IssuesRoutingModule,
    SettingsRoutingModule,
    UiSwitchModule,
    RoleManagementRoutingModule,
    TabsModule.forRoot(),
  ],
  providers:[
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
   

  ],
 
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class LayoutModule { }
