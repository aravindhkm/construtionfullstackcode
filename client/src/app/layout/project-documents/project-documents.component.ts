import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService, ModalDialogService } from 'src/app/services';

@Component({
  selector: 'app-project-documents',
  templateUrl: './project-documents.component.html',
  styleUrls: ['./project-documents.component.scss']
})
export class ProjectDocumentsComponent implements OnInit {
  page=1
  itemsPerPage=10
  search=''
  collection
  projectDocumentsList=[]
  submitted = false
  projectDocumentsTitle
  statusItem=[{name:'Active',id:true},{name:'InActive',id:false}]

  constructor(private activatedRoute: ActivatedRoute, private router: Router,private toastr:ToastrManager,
    private apiService:ApiService,private modalDialogService:ModalDialogService) { 
    }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params:Params)=>{
      let title=params
      this.search=''
      this.page=1
      if(this.router.url.includes('back=true') && sessionStorage){
      let sessionData=JSON.parse(sessionStorage.getItem('documentsSessionData'))
      this.search=sessionData && sessionData.search ? sessionData.search : ''
      this.page=sessionData && sessionData.page ? sessionData.page : 1
        this.projectDocumentsTitle = title.soi == "soi" ? "soi" : title.soi == "tds" ? "tds" : title.soi == "claims" ? "claims" : "document" ;
        this.getDocumentsList(this.projectDocumentsTitle)
      }
      else{
        this.projectDocumentsTitle = title.soi == "soi" ? "soi" : title.soi == "tds" ? "tds" : title.soi == "claims" ? "claims" : "document" ;
        this.getDocumentsList(this.projectDocumentsTitle)
      }
    })
  }
  getDocumentsList(documentType){
    this.apiService.get('documents/list?page=' + this.page + '&itemsPerPage=' + this.itemsPerPage + '&searchTxt=' + this.search + '&type=' + documentType ).subscribe(resp=>{
      if(resp){
        this.projectDocumentsList=resp.data.rows
        this.collection=resp.data.count
      }
    })
  }
  viewPath(id){
    let obj={
      "page":this.page,
      "search":this.search,
      "itemsPerPage":this.itemsPerPage
    }
    sessionStorage.setItem('documentsSessionData',JSON.stringify(obj))
    this.projectDocumentsTitle == "soi" ? this.router.navigateByUrl('/documents/soi/edit/' + id) :
    this.projectDocumentsTitle == "tds" ? this.router.navigateByUrl('/documents/tds/edit/' + id) : 
    this.projectDocumentsTitle == "claims" ? this.router.navigateByUrl('/documents/claims/edit/' + id) :
    this.router.navigateByUrl('document/edit/' + id)
  }
  deleteDocument(id){
    let projectId  = id
    this.modalDialogService.confirm("Confirm Delete","Do you really want to delete ?","Confirm","Cancel").subscribe(result=>{
      if(result){
      this.apiService.delete('documents/deleteDocument?projectId=' + projectId + '&type=' + this.projectDocumentsTitle).subscribe(resp =>{
        if(resp && resp.status == 200){
          this.toastr.successToastr(resp.message)
          this.getDocumentsList(this.projectDocumentsTitle)
        }
      })
      }
    })
  }
  onReset(){
    sessionStorage.removeItem('documentsSessionData')
    this.search=''
    this.page=1
    this.getDocumentsList(this.projectDocumentsTitle)
  }
  submit(data){
    this.search=data.search
      this.getDocumentsList(this.projectDocumentsTitle)
  }
  addPath(){
    let obj={
      "page":this.page,
      "search":this.search,
      "itemsPerPage":this.itemsPerPage
    }
    sessionStorage.setItem('documentsSessionData',JSON.stringify(obj))
    this.projectDocumentsTitle == "soi" ? this.router.navigateByUrl('/documents/soi/add') :
    this.projectDocumentsTitle == "tds" ? this.router.navigateByUrl('/documents/tds/add') : 
    this.projectDocumentsTitle == "claims" ? this.router.navigateByUrl('/documents/claims/add') :
    this.router.navigateByUrl('/document/add')
  }
  onChange(event){
    this.page=event
    this.getDocumentsList(this.projectDocumentsTitle)
    }
}