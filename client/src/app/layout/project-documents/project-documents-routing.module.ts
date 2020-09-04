import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddDocumentsComponent } from './add-documents/add-documents.component';
import {AddCommondocumentComponent} from './add-commondocument/add-commondocument.component'

const routes: Routes = [
  // { path : 'document/add', component : AddDocumentsComponent},
  // { path : 'document/edit/:id', component : AddDocumentsComponent},

  // { path : 'documents/:soi/add', component : AddCommondocumentComponent},
  // { path : 'documents/:soi/edit/:id', component : AddCommondocumentComponent},
  // { path : 'documents/:tds/add', component : AddCommondocumentComponent},
  // { path : 'documents/:tds/edit/:id', component : AddCommondocumentComponent},
  // { path : 'documents/:claims/add', component : AddCommondocumentComponent},
  // { path : 'documents/:claims/edit/:id', component : AddCommondocumentComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectDocumentsRoutingModule { }
