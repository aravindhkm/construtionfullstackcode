import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddProjectComponent } from './add-project/add-project.component';


const routes: Routes = [
    
        { path: 'project/add', component: AddProjectComponent},
        { path : 'project/edit/:id',component:AddProjectComponent},
    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectRoutingModule {
}
