import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService } from '../../../services/api.service'
import { environment } from "src/environments/environment";
import { Location } from '@angular/common';

@Component({
  selector: 'app-drop-monitoring',
  templateUrl: './drop-monitoring.component.html',
  styleUrls: ['./drop-monitoring.component.scss']
})
export class DropMonitoringComponent implements OnInit {

  id;
  createDropMonitorForm=[]
  imgUrl;
  dropData = [];
  // monitorId;
  projectId;
  imgPreviewUrl;
  isDropPage = true;
  monitorValueId : '';
  monitorValueMapId : '';
  imageId : '';
  imagePath;
  submission = false;

  constructor(private activatedRoute: ActivatedRoute,private router: Router,
    private fb: FormBuilder, private toastr: ToastrManager, private api: ApiService,
    private location: Location) {
    this.imgUrl = environment.image_url
  }

  ngOnInit(): void {
    this.setIds();
    this.dropData = [
      {
        "textField" : '',"monitorValueId" : '',"monitorValueMapId" : ''
      }
    ] 
    if(this.imageId || this.monitorValueId){
      this.editList();
    }
  }

  ngDoCheck(){
    this.setIds();
  }

  setIds(){
    this.activatedRoute.params.subscribe((params: Params) => {
      if(params && params.dropmonitor == "dropmonitor"){
        this.isDropPage = true;        
        // this.monitorValueId = params.id
      }else{
        this.isDropPage = false;
        // this.monitorValueId = params.id
        // this.monitorValueMapId = params.id
      }
      // this.monitorId = params.id;
      this.projectId = params.projectId;
      this.imageId = params.imageId;
      this.monitorValueId = params.monitorValueId
      this.monitorValueMapId = params.monitorValueMapId
    })
  }

  editList() {
    let editName = '' 
    if(this.isDropPage){
      editName = 'monitorId=' + this.imageId
    }else{
      editName = 'monitorValueId=' + this.monitorValueId
    }   
    this.api.get('monitors/list?'+editName).subscribe(resp => {
      if (resp && resp.status == "200" && resp.data && resp.data.rows && resp.data.rows[0] && resp.data.rows[0].ProjectMonitors &&  
            resp.data.rows[0].ProjectMonitors[0] && resp.data.rows[0].ProjectMonitors[0].ProjectMonitorValues) {
        // this.dropData = [];
        let arry = [];

                let respData = []
              if(this.isDropPage){
                respData = resp.data.rows[0].ProjectMonitors[0].ProjectMonitorValues
              }else{
                respData = resp.data.rows[0].ProjectMonitors[0].ProjectMonitorValueMaps
              }
              this.imagePath = this.imgUrl + 'project-documents/work-monitors/' + resp.data.rows[0].ProjectMonitors[0].imageName

              respData.map((item,index) => {
           let obj = {
            "textField" : item.name
           }
           if(this.isDropPage){
            obj['monitorValueId'] = item.id
           }else{
            obj['monitorValueId'] = item.monitorValueId;
            obj['monitorValueMapId'] = item.id 
           }

           obj['isSave'] = true

          //  this.isDropPage ? obj['monitorValueId'] = item.monitorValueId : obj['monitorValueMapId'] = item.id           
           arry.push(obj)
         })

         if(arry.length >0){
           this.dropData = [];
           this.dropData = arry
         }
       
              

      }
    })
  }

  onTextChange(event,index){
    this.dropData[index].textField = event.target.value;
    this.dropData[index].isSave = false;
  }

  formValidation(){
    let click = true;   
    this.dropData.map((item,i) => {
      if(!item.textField || !item.isSave){
        click = false;
      }
    })
    return click;
  }

  onButtonClick(event,data){   
    event.preventDefault();
    this.submission = true;
    if(this.formValidation()){
      //submit Function
      if(this.isDropPage){
        this.dropData = [
          {
            "textField" : '',"monitorValueId" : '',"monitorValueMapId" : ''
          }
        ]
        this.router.navigateByUrl('work-monitor/typemonitor/'+this.projectId +'/' +this.imageId +'/'+ data.monitorValueId);
        this.toastr.successToastr("Page Navigation")
      }else{
        this.router.navigateByUrl('work-monitor/imagemonitor/'+this.projectId +'/' +this.imageId +'/'+ data.monitorValueId+'/'+data.monitorValueMapId);
        this.toastr.successToastr("Navigate to 4th form")
      }
      
    }else{
      this.toastr.errorToastr("Please Click Tick Button OR Save before Navigate to Next Page")
    }
  }

  addField(event){
    event.preventDefault();
    let obj = {
      "textField" : '',"monitorValueId" : '','monitorValueMapId' : ''
    }

    this.dropData.push(obj);
  }

  removeField(event,index){
    event.preventDefault()
    this.dropData.splice(index,1)
  }

  onSubmit(event,index){
    event.preventDefault();
    this.submission = true;
    
    if(index){
      this.dropData[index].isSave = true
    }else{    
      this.dropData.map((item, i) => {
        if (item.textField) {
          this.dropData[i].isSave = true
        }
      })
    }


    let arry = [];
    if(this.formValidation()){
    this.dropData.map((item,index) => {                  
         let params = {
          "name" : item.textField,
          "monitorId" : this.imageId,
          "projectId" : this.projectId,                    
        }		
        if(!this.isDropPage){
          params['monitorValueId'] = this.monitorValueId
          params['monitorValueMapId'] = item.monitorValueMapId
        }else
        if(this.isDropPage){
          params['monitorValueId'] = item.monitorValueId
        }
        arry.push(params)
    })
    let array = {
      'monitorData' : arry
    }
    let path = "";
    if(this.isDropPage){
      path = "createDrop"
    }else{
      path = "createDropValue"
    }
    
    this.api.post('monitors/'+path,array).subscribe(resp => {
      if(resp && resp.status == "200"){
        this.toastr.successToastr(resp.message);
        if(index){
          this.editList();         
        }else{
          this.location.back();
        }       
      }				
    }, err => {
      err.error.message ? this.toastr.errorToastr(err.error.message) :
      this.toastr.errorToastr(err.error.errors[0].message);
    })
  }else{
    this.toastr.errorToastr("Mandatory Fields are missing")
  }
  }

  listPath(){
      this.location.back();
  }

}
