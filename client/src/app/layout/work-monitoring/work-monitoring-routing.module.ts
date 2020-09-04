
import { AddworkMonitoringComponent } from './addwork-monitoring/addwork-monitoring.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ImageMonitoringComponent } from './image-monitoring/image-monitoring.component';
import { DropMonitoringComponent } from './drop-monitoring/drop-monitoring.component';

const routes: Routes = [
  // { path : 'work-monitor/add', component : AddworkMonitoringComponent},
  // { path : 'work-monitor/edit/:projectId', component : AddworkMonitoringComponent},

  // { path : 'work-monitor/imagemonitor/:projectId/:imageId/:monitorValueId/:monitorValueMapId', component : ImageMonitoringComponent},


  // { path : 'work-monitor/:dropmonitor/:projectId/:imageId', component : DropMonitoringComponent},

  // { path : 'work-monitor/:typemonitor/:projectId/:imageId/:monitorValueId', component : DropMonitoringComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkMonitoringRoutingModule { }
