import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService, ModalDialogService } from 'src/app/services';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.scss']
})
export class TodosComponent implements OnInit {
  page=1
  itemsPerPage=10
  collection
  todoDatas=[]
  search=''
  submitted = false
  
  constructor(private activatedRoute: ActivatedRoute, private router: Router,private toastr:ToastrManager,
    private apiService:ApiService,private modalDialogService:ModalDialogService) { }

  ngOnInit() {
    if(this.router.url.includes('back=true') && sessionStorage){
      let sessionData=JSON.parse(sessionStorage.getItem('todoSessionData'))
      this.search=sessionData && sessionData.search ? sessionData.search : ''
      this.page=sessionData && sessionData.page ? sessionData.page : 1
      this.getTodoList()
    }
    else{
      sessionStorage.removeItem('todoSessionData')
      this.search=''
      this.itemsPerPage=10
      this.page=1
    this.getTodoList()
    }
   
  }
  getTodoList(){
    this.apiService.get('todos/list?page=' + this.page + '&itemsPerPage=' + this.itemsPerPage + '&searchTxt=' + this.search).subscribe(resp=>{
      if(resp && resp.data && resp.data.rows){
        this.todoDatas=resp.data.rows
        this.collection=resp.data.rows.length
      }
    })
  }
  create(){
    let obj={
      "page":this.page,
      "search":this.search,
      "itemsPerPage":this.itemsPerPage
    }
    sessionStorage.setItem('todoSessionData',JSON.stringify(obj))
    this.router.navigateByUrl('todo/add')
  }

  onChange(event){
    this.page=event
    this.getTodoList()
    }
    
  submit(data) {
    this.search=data.search
      this.getTodoList()
  }
  onReset(){
    sessionStorage.removeItem('todoSessionData')
    this.search=''
    this.page=1
    this.itemsPerPage=10
    this.getTodoList()
  }
  listPath(){
    
  }
  viewPath(id){
    let obj={
      "page":this.page,
      "search":this.search,
      "itemsPerPage":this.itemsPerPage
    }
    sessionStorage.setItem('todoSessionData',JSON.stringify(obj))
    this.router.navigateByUrl('todo/edit/' + id)
  }
  delete(id){
    this.modalDialogService.confirm("Confirm Delete","Do you really want to delete ?","Confirm","Cancel").subscribe(result =>{
      if(result){
        this.apiService.delete('todos/deleteTodo?todoId=' + id).subscribe(resp=>{
          if(resp.status == 200){
            this.toastr.successToastr(resp.message)
            this.getTodoList()
          }
        })
      }
    })
  }
}
