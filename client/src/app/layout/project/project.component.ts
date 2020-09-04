import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService, ModalDialogService } from 'src/app/services';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  page=1
  itemsPerPage=10
  collection
  projectDatas=[]
  search=''
  submitted = false
  
 
  constructor(private activatedRoute: ActivatedRoute, private router: Router,private toastr:ToastrManager,
    private apiService:ApiService,private modalDialogService:ModalDialogService) { }

  ngOnInit() {
    if(this.router.url.includes('back=true') && sessionStorage){
      let sessionData=JSON.parse(sessionStorage.getItem('projectSessionData'))
      this.search=sessionData && sessionData.search ? sessionData.search : ''
      this.page=sessionData && sessionData.page ? sessionData.page : 1
      this.getProjectList()
    }
    else{
      sessionStorage.removeItem('projectSessionData')
      this.search=''
      this.itemsPerPage=10
      this.page=1
    this.getProjectList()
    }
   
  }
  getProjectList(){
    this.apiService.get('projects/list?page=' + this.page + '&itemsPerPage=' + this.itemsPerPage + '&searchTxt=' + this.search).subscribe(resp=>{
      if(resp){
        this.projectDatas=resp.data.rows
        this.collection=resp.data.count
      }
    })
  }
  create(){
    let obj={
      "page":this.page,
      "search":this.search,
      "itemsPerPage":this.itemsPerPage
    }
    sessionStorage.setItem('projectSessionData',JSON.stringify(obj))
    this.router.navigateByUrl('project/add')
  }

  onChange(event){
    this.page=event
    this.getProjectList()
    }
    
  submit(data) {
    this.search=data.search
      this.getProjectList()
  }
  onReset(){
    sessionStorage.removeItem('projectSessionData')
    this.search=''
    this.page=1
    this.itemsPerPage=10
    this.getProjectList()
  }
  listPath(){
    
  }
  viewPath(id){
    let obj={
      "page":this.page,
      "search":this.search,
      "itemsPerPage":this.itemsPerPage
    }
    sessionStorage.setItem('projectSessionData',JSON.stringify(obj))
    this.router.navigateByUrl('project/edit/' + id)
  }
  delete(id){
    this.modalDialogService.confirm("Confirm Delete","Do you really want to delete ?","Confirm","Cancel").subscribe(result =>{
      if(result){
        this.apiService.delete('projects/deleteProject?projectId=' + id).subscribe(resp=>{
          if(resp.status == 200){
            this.toastr.successToastr(resp.message)
            this.getProjectList()
          }
        })
      }
    })
  }
}