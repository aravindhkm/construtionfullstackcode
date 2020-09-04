import { AddTodosComponent } from './add-todos/add-todos.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path : "todo/add" , component : AddTodosComponent},
  { path : "todo/edit/:id" , component : AddTodosComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TodosRoutingModule { }
