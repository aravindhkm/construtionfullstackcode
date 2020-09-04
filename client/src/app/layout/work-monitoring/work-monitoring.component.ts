import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService, ModalDialogService } from 'src/app/services';

@Component({
  selector: 'app-work-monitoring',
  templateUrl: './work-monitoring.component.html',
  styleUrls: ['./work-monitoring.component.scss']
})
export class WorkMonitoringComponent implements OnInit {
  page=1
  itemsPerPage=10
  collection
  workMonitoringDatas=[]
  search=''
  submitted = false
  

  constructor(private activatedRoute: ActivatedRoute, private router: Router,private toastr:ToastrManager,
    private apiService:ApiService,private modalDialogService:ModalDialogService) { }

  ngOnInit() {
    if(this.router.url.includes('back=true') && sessionStorage){
      let sessionData=JSON.parse(sessionStorage.getItem('workMonitorSessionData'))
      this.search=sessionData && sessionData.search ? sessionData.search : ''
      this.page=sessionData && sessionData.page ? sessionData.page : 1
      this.getWorkMonitoringList()
    }
    else{
      sessionStorage.removeItem('workMonitorSessionData')
      this.search=''
      this.itemsPerPage=10
      this.page=1
    this.getWorkMonitoringList()
    }
   
  }
  getWorkMonitoringList(){
    this.apiService.get('monitors/list?page=' + this.page + '&itemsPerPage=' + this.itemsPerPage + '&searchTxt=' + this.search).subscribe(resp=>{
      if(resp){
        this.workMonitoringDatas=resp.data.rows
        this.collection=resp.data.count
      }
    })
  }
  onChange(event){
    this.page=event
    this.getWorkMonitoringList()
    }
    
  submit(data) {
    this.search=data.search
      this.getWorkMonitoringList()
  }
  onReset(){
    sessionStorage.removeItem('projectSessionData')
    this.search=''
    this.page=1
    this.itemsPerPage=10
    this.getWorkMonitoringList()
  }
  listPath(){
    
  }
  viewPath(id){
    let obj={
      "page":this.page,
      "search":this.search,
      "itemsPerPage":this.itemsPerPage
    }
    sessionStorage.setItem('workMonitorSessionData',JSON.stringify(obj))
    this.router.navigateByUrl('work-monitor/edit/' + id)
  }
  delete(id){
    this.modalDialogService.confirm("Confirm Delete","Do you really want to delete ?","Confirm","Cancel").subscribe(result =>{
      if(result){
        this.apiService.delete('monitors/deleteWork?projectId=' + id).subscribe(resp=>{
          if(resp.status == 200){
            this.toastr.successToastr(resp.message)
            this.getWorkMonitoringList()
          }
        })
      }
    })
  }
}
