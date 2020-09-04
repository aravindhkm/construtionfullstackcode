import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService, ModalDialogService } from 'src/app/services';

@Component({
  selector: 'app-condition',
  templateUrl: './condition.component.html',
  styleUrls: ['./condition.component.scss']
})
export class ConditionComponent implements OnInit {
  page=1
  itemsPerPage=10
  collection
  conditionData=[]
  search=''
  submitted = false
  isConditionPage = false
  
 
  constructor(private activatedRoute: ActivatedRoute, private router: Router,private toastr:ToastrManager,
    private apiService:ApiService,private modalDialogService:ModalDialogService) { }

  ngOnInit() {      
    if(this.router.url.includes('back=true') && sessionStorage){
      let sessionData=JSON.parse(sessionStorage.getItem('conditionSessionData'))
      this.search=sessionData && sessionData.search ? sessionData.search : ''
      this.page=sessionData && sessionData.page ? sessionData.page : 1
      this.activatedRoute.params.subscribe((params:Params)=>{
        this.isConditionPage =  params.condition == 'condition' ? true : false   
        this.getConditionList() 
      })
    }
    else{
      sessionStorage.removeItem('conditionSessionData')
      this.activatedRoute.params.subscribe((params:Params)=>{
        this.search=''
      this.itemsPerPage=10
      this.page=1
        this.isConditionPage =  params.condition == 'condition' ? true : false   
        this.getConditionList() 
      })
    }
  }


  // ngDoCheck(){
  //   this.activatedRoute.params.subscribe((params:Params)=>{
  //     this.isConditionPage =  params.condition == 'condition' ? true : false    })
  // }

  getConditionList(){
    let condition=this.isConditionPage ? 'condition' : 'pre-condition'
    this.apiService.get('survey/list?type=' + condition + '&page=' + this.page + '&itemsPerPage=' + this.itemsPerPage + '&searchTxt=' + this.search).subscribe(resp=>{
      if(resp){
        this.conditionData=resp.data.rows
        this.collection=resp.data.count
      }
    })
  }
  onChange(event){
    this.page=event
    this.getConditionList()
    }
    
  submit(data) {
    this.search=data.search
      this.getConditionList()
  }
  onReset(){
    sessionStorage.removeItem('conditionSessionData')
    this.search=''
    this.page=1
    this.itemsPerPage=10
    this.getConditionList()
  }
  listPath(){
    
  }
  viewPath(id){
    let obj={
      "page":this.page,
      "search":this.search,
      "itemsPerPage":this.itemsPerPage
    }
    sessionStorage.setItem('conditionSessionData',JSON.stringify(obj))
    if(this.isConditionPage){
      this.router.navigateByUrl('survey/condition/view/' + id)
    }else{
      this.router.navigateByUrl('survey/precondition/view/' + id)
    }
   
  }

  delete(id){
    let condition=this.isConditionPage ? 'condition' : 'pre-condition'
    this.modalDialogService.confirm("Confirm Delete","Do you really want to delete ?","Confirm","Cancel").subscribe(result =>{
      if(result){
        this.apiService.delete('survey/deleteSurvey?type='+ condition + '&projectId=' + id).subscribe(resp=>{
          if(resp.status == 200){
            this.toastr.successToastr(resp.message)
            this.getConditionList()
          }
        })
      }
    })
  }
}
