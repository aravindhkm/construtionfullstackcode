import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService } from '../../../services/api.service'
import { environment } from "src/environments/environment";
import { Location } from '@angular/common';

@Component({
  selector: 'app-image-monitoring',
  templateUrl: './image-monitoring.component.html',
  styleUrls: ['./image-monitoring.component.scss']
})
export class ImageMonitoringComponent implements OnInit {
  id;
  createImageMonitorForm: FormGroup
  fileData: any = [];
  imagePreviewUrl: any = [];
  projectEditDatas: any = []
  monitorValueId;
  monitorValueMapId;
  imgUrl;
  submitted=false
  constructor(private activatedRoute: ActivatedRoute, private router: Router,
    private fb: FormBuilder, private toastr: ToastrManager, private api: ApiService,
    private location: Location) {
    this.imgUrl = environment.image_url

  }

  ngOnInit(): void {
    this.setIds();

    if (this.monitorValueMapId) {
      this.editList();
    }
  }

  ngDoCheck() {
    this.setIds();
  }

  setIds() {
    this.activatedRoute.params.subscribe((params: Params) => {
      // this.projectId = params.projectId;
      // this.imageId = params.imageId;
      this.monitorValueId = params.monitorValueId
      this.monitorValueMapId = params.monitorValueMapId
    })
  }

  editList() {
    this.api.get('monitors/list?monitorValueId=' + this.monitorValueId).subscribe(resp => {
      if (resp && resp.status == "200" && resp.data && resp.data.rows && resp.data.rows[0] &&
        resp.data.rows[0].ProjectMonitors && resp.data.rows[0].ProjectMonitors[0] && resp.data.rows[0].ProjectMonitors[0].ProjectMonitorValueMaps && resp.data.rows[0].ProjectMonitors[0].ProjectMonitorValueMaps[0] && resp.data.rows[0].ProjectMonitors[0].ProjectMonitorValueMaps[0].imageName
      ) {
        let imageArray = resp.data.rows[0].ProjectMonitors[0].ProjectMonitorValueMaps[0].imageName;
        let imagePath = resp.data.rows[0].ProjectMonitors[0].ProjectMonitorValueMaps[0].path
        let arry = [];
        let fileArry = [];
        imageArray.map((item, index) => {
          arry.push(this.imgUrl + imagePath +'/'+ item);
          fileArry.push({"editImageName" : item});
        })
        this.imagePreviewUrl = arry;
        this.fileData = fileArry;
      }
    })
  }

  removeImage(event, data) {
    event.preventDefault();
    this.fileData.splice(data, 1)
    this.imagePreviewUrl.splice(data, 1)
  }

  fileProgress(fileInput: any) {
    var filesAmount = fileInput.target.files.length;
    if (fileInput.target.files) {
      for (let i = 0 ; i < filesAmount; i++) {
        this.fileData.push(<File>fileInput.target.files[i])
      }
    }
    this.preview(fileInput);
  }

  preview(fileInput) {
    var filesAmount = fileInput.target.files.length;
    for (let i = 0; i < filesAmount; i++) {
      var reader = new FileReader();

      reader.onload = (event: any) => {
        this.imagePreviewUrl.push(event.target.result);
      }
      reader.readAsDataURL(fileInput.target.files[i]);
    }
  }

  listPath() {
    this.location.back();
  }

  onSubmit() {
    let paramsData = new FormData();
    let params = []
    let editImgArry = [];
    if (this.fileData.length > 0) {
      this.fileData.map((item) => {
        if(item.editImageName){
          editImgArry.push(item.editImageName)
        }else{
          paramsData.append("monitorValues", item)
        }
      })
    }

    let paramObj = {
      monitorValueId: this.monitorValueId,
      monitorValueMapId: this.monitorValueMapId,
    }
    if(editImgArry.length > 0){
      paramObj['imageName'] = editImgArry
    }
    params.push(paramObj);
    paramsData.append("monitorData", JSON.stringify(params))
    this.api.mulipartPost('monitors/createDropValueImages', paramsData).subscribe(resp => {
      if (resp && resp.status == "200") {
        this.toastr.successToastr(resp.message);
        this.router.navigateByUrl('work-monitor')
        // this.editList();
        // this.staffRoute ? this.router.navigateByUrl('/user/staff?back=true') : this.router.navigateByUrl('/user/contractor?back=true')
      }
    }, err => {
      err.error.message ? this.toastr.errorToastr(err.error.message) :
        this.toastr.errorToastr(err.error.errors[0].message);
    })
    // createDropValueImages
  }

}
