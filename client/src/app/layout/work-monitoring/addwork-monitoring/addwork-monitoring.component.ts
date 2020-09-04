import { Component, OnInit ,EventEmitter ,Input ,Output} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService } from '../../../services/api.service'
import { environment } from "src/environments/environment";
import { Location } from '@angular/common';
import { ModalDialogService } from 'src/app/services';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-addwork-monitoring',
  templateUrl: './addwork-monitoring.component.html',
  styleUrls: ['./addwork-monitoring.component.scss']
})
export class AddworkMonitoringComponent implements OnInit {

  submitted = false
  // workMonitoringForm: FormGroup
  imagePreviewUrl: any = [];
  imgUrl;
  // workMonitoringDDList: any = [];
  workMonitoringDD: any = [];
  // dropdownSettings: any = {}
  imageData = [];
  projectId = '';
  submission = false;
  monitorDatas = []
  modalRef: BsModalRef;
  exportChildData = [];
  projectName = '';
  monitorName = '';
  baseUrl = '';
  onClick = false;
  @Input() WORKID: string;
  @Input() WORK: string;

  @Output() Projects: EventEmitter<any> = new EventEmitter();

  // @ViewChild('childData', { static: false }) childData: ElementRef;

  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private fb: FormBuilder, private toastr: ToastrManager, private api: ApiService,
    private location: Location, private modalDialogService: ModalDialogService,
    private modalService: BsModalService) {
    this.imgUrl = environment.image_url,
      this.baseUrl = environment.api_url
  }

  ngOnInit(): void {
    this.imageData = [
      {
        "imagePreview": '', "fileName": '', "imageId": ''
      }
    ]

    // this.activatedRoute.params.subscribe((params: Params) => {
    //   this.projectId = params.projectId ? params.projectId : ''
    // })
    let DocId :any= sessionStorage.getItem("ProjectId");
    if(DocId && this.WORKID=='workMonitor-add')
    {
       let datas = JSON.parse(DocId);
       this.projectId = datas.id;
    }
    else {
      this.projectId = this.WORKID ? this.WORKID :'';
    }
   

    if (this.projectId) {
      this.editList({ id: this.projectId }, true)
    }
    // this.getProject();
  }

  editList(options, isEdit) { //OnChange DropDown OR Edit List
    let id = '';
    if (isEdit) {
      id = options.id
    }
    if (!isEdit) {
      id = options.item_id
    }
    this.api.get('monitors/list?projectId=' + id).subscribe(resp => {
      if (resp && resp.status == "200" && resp.data && resp.data.rows && resp.data.rows[0] && resp.data.rows[0].monitors.length > 0) {
        let respData = resp.data.rows[0];
        this.projectName = resp.data.rows[0].title
        let arry = [];
        respData.monitors && respData.monitors.map((item, index) => {
          let path = item.path ? item.path : "project-documents/work-monitors/"
          let obj = {
            imagePreview: this.imgUrl + path + item.imageName,
            fileName: item.imageName,
            imageId: item.id,
            exportName: item.title,
            isParentChecked: false,
            mapValue:item.mapValue,
            monitorValue:item.monitorValue
          }
          arry.push(obj);
        })
        if (arry.length > 0) {
          this.imageData = [];
          this.imageData = arry;
        }
      } else {
        this.imageData = [
          {
            "imagePreview": '', "fileName": '', "imageId": ''
          }
        ]
      }
    })
  }

  onImgClick(imageId, index) {
    this.onClick = true
    this.api.get('monitors/list?monitorId=' + imageId).subscribe(resp => {
      if (resp && resp.status == "200" && resp.data && resp.data.rows && resp.data.rows[0] && resp.data.rows[0].monitors &&
        resp.data.rows[0].monitors[0] && resp.data.rows[0].monitors[0].monitorValue) {


        let dropResp = resp.data.rows[0].monitors[0].monitorValue
        let subDropResp = resp.data.rows[0].monitors[0].mapValue
        this.monitorName = resp.data.rows[0].monitors[0].title
        let monitorDatas = []
        dropResp.map((item, index) => {

          let dropArry = [];

          if (subDropResp.length > 0) {
            subDropResp.map((subItem, subIndex) => {
              let obj = {}
              if (item.id == subItem.monitorValueId) {
                obj['parentId'] = item.id,
                  obj['parentName'] = item.name,
                  obj['childName'] = subItem.name,
                  obj['imageName'] = subItem.imageName,
                  obj['imageId'] = imageId,
                  obj['imagePath']=subItem.path,
                  obj['isChildChecked'] = false
                dropArry.push(obj);
              }
            })
          } else {
            let obj = {}
            obj['parentId'] = item.id,
              obj['parentName'] = item.name,
              obj['isChildChecked'] = false
            dropArry.push(obj);
          }

          monitorDatas.push(dropArry);
        })
        if (monitorDatas.length < 1) {
          this.toastr.errorToastr("No Record Found")
        }

        this.monitorDatas = monitorDatas
      }
    })
  }

  openModal(event, template, data) {
    event.preventDefault();

    this.modalRef = this.modalService.show(template);
  }

  onParentCheckBoxChange(data, index) {
    this.imageData[index].isParentChecked = data.isParentChecked ? false : true
  }

  onChildCheckBoxChange(data, index) {
    this.monitorDatas[index].isChildChecked = data.isChildChecked ? false : true
  }

  exportParent() {
    let anyChecked = false;
    let monitorId=[]
    this.imageData.forEach((item)=>{
      item.isParentChecked ?  monitorId.push(item.imageId) : ''
     })
    this.imageData.map((item, index) => {
      if (item.isParentChecked && item.mapValue.length > 0) {
        event.preventDefault();
        anyChecked = true
        var link = document.createElement('a');
        link.href = this.baseUrl + 'monitors/exportPdf?monitorId=' + monitorId + '&projectId=' + this.projectId + '&type=three';
        link.target = '_blank';
        link.download = 'Work-monitoring' + '.pdf';
        link.dispatchEvent(new MouseEvent('click'));
      }
      else{
        item.isParentChecked ? anyChecked = true : ''
        item.isParentChecked ? this.toastr.errorToastr("No Data Found") : ''
      }
    })
    if(!anyChecked){
      this.toastr.errorToastr("Please Select any Checkbox to Export")
    }
    
  }


  exportChild() {
    let anyChecked = false;
    let monitorValueId=[]
    this.monitorDatas.forEach((item)=>{
     item.isChildChecked ?  monitorValueId.push(item[0].parentId) : ''
    })
    this.monitorDatas.map((item, index) => {
      if (item.isChildChecked) {
        // monitorValueId
        event.preventDefault();
        anyChecked = true
        var link = document.createElement('a');
        link.href = this.baseUrl+'monitors/exportPdf?monitorId='+item[0].imageId+'&projectId='+this.projectId+'&monitorValueId='+monitorValueId+'&type=three';
        link.target = '_blank';
        link.download = item.exportName+'.pdf';
        link.dispatchEvent(new MouseEvent('click'));
      }
    })
    if(!anyChecked){
      this.toastr.errorToastr("Please Select any Checkbox to Export")
    }
  }

  listPath() {
    this.router.navigateByUrl('/work-monitor?back=true')
  }
}