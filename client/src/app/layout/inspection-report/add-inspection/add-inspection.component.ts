import { Component, OnInit ,EventEmitter ,Input ,Output} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService } from '../../../services/api.service'
import { environment } from "src/environments/environment";
import { Location } from '@angular/common';
import { ModalDialogService } from 'src/app/services';

@Component({
  selector: 'app-add-inspection',
  templateUrl: './add-inspection.component.html',
  styleUrls: ['./add-inspection.component.scss']
})
export class AddInspectionComponent implements OnInit {

  submitted = false
  inspectionReportForm: FormGroup
  imagePreviewUrl: any = [];
  imgUrl;
  inspectionReportDDList: any = [];
  inspectionReportDD: any = [];
  dropdownSettings: any = {}
  imageData = [];
  projectId = '';
  submission = false;
  projectTitle
  respData
  inspectionPointsData = []
  blockTitle
  imageCheckedData = []
  isChecked=false
  baseUrl;
  @Input() INSPECID: string;
  @Input() INSPEC: string;


  @Output() Projects: EventEmitter<any> = new EventEmitter();

  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private fb: FormBuilder, private toastr: ToastrManager, private api: ApiService,
    private location: Location, private modalDialogService: ModalDialogService) {
    this.imgUrl = environment.image_url
    this.baseUrl=environment.api_url
  }

  ngOnInit() {
    // this.activatedRoute.params.subscribe((params: Params) => {
    //   this.projectId = params.projectId ? params.projectId : ''
    // })
    let DocId :any= sessionStorage.getItem("ProjectId");
    if(DocId && this.INSPECID=='inspection-add')
    {
       let datas = JSON.parse(DocId);
       this.projectId = datas.id;
    }
    else {
      this.projectId = this.INSPECID ? this.INSPECID : '';
    }

    this.imageData = [
      {
        "fileData": File = null, "textField": '', "imagePreview": '', "fileName": '', "imageId": ''
      }
    ]
    this.inspectionReportForm = this.fb.group({
      inspectionReportDD: [[], Validators.required]
    })

    if (this.projectId) {
      this.editList({ id: this.projectId }, true)
    }
    this.getProject();
  }
  getProject() { //Get DropDown List
    this.api.get('projects/listProjects').subscribe(resp => {
      if (resp && resp.status == "200" && resp.data) {
        let DDList = [];
        resp.data.map(item => {
          let obj = { "item_id": item.id, "item_text": item.title }
          DDList.push(obj);
        })
        this.inspectionReportDDList = DDList;
      }
    })
  }
  get f() {
    return this.inspectionReportForm.controls
  }


  editList(options, isEdit) { //OnChange DropDown OR Edit List
    let id = '';
    if (isEdit) {
      id = options.id
    }
    if (!isEdit) {
      id = options.item_id
    }
    this.api.get('shared/list?projectId=' + id).subscribe(resp => {
      this.projectTitle = resp.data.rows[0].title
      if (resp && resp.status == "200" && resp.data && resp.data.rows && resp.data.rows[0] && resp.data.rows[0].inspections.length > 0) {
        this.respData = resp.data.rows[0];
        let arry = [];
        this.respData.inspections && this.respData.inspections.map((item, index) => {
          let obj = {
            textField: item.name,
            imagePreview: this.imgUrl + item.path + item.imageName,
            fileName: item.imageName,
            imageId: item.id,
            isSave: true,
            isParentChecked:false
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
            "fileData": File = null, "textField": '', "imagePreview": '', "fileName": '', "imageId": '',"isImageChecked":false
          }
        ]
      }
    })
  }
  onImageClick(i) {
    this.blockTitle = this.respData.inspections[i].name
    if (this.respData && this.respData.inspections[i] && this.respData.inspections[i].pointMaps.length > 0) {
      this.respData.inspections[i].pointMaps.forEach(item => {
        item['imageUrl'] = this.imgUrl
      });
      this.inspectionPointsData = this.respData.inspections[i].pointMaps
    }
    else {
      this.inspectionPointsData = []
      this.toastr.errorToastr("No Datas Found")
    }
  }
  onExportChild(Data) {
    event.preventDefault();
    var link = document.createElement('a');
    link.href =this.baseUrl+'shared/exportPdf?inspectionId='+Data[0].inspectionId+'&projectId='+this.projectId+'&type=three';
    link.target = '_blank';
    link.download = 'Inspection-report' +'.pdf';
    link.dispatchEvent(new MouseEvent('click'));
  }
  onExportParent() {
    let anyChecked=false
    let inspectionId=[]
    this.imageData.forEach((item)=>{
      item.isParentChecked ? inspectionId.push(item.imageId) : ''
    })
    this.imageData.map((item, index) => {
      if (item.isParentChecked) {
        anyChecked=true
        event.preventDefault();
        var link = document.createElement('a');
        link.href =this.baseUrl+'shared/exportPdf?inspectionId='+inspectionId+'&projectId='+this.projectId+'&type=three';
        link.target = '_blank';
        link.download = item.exportName+'.pdf';
        link.dispatchEvent(new MouseEvent('click'));
      }
    })
    if(!anyChecked){
      this.toastr.errorToastr("Please Select Checkbox to Export")
    }
  }
  onCheckBoxChange(data, index) {
    this.imageData[index].isParentChecked = data.isParentChecked ? false : true
  }
  addField(event) {
    event.preventDefault();
    let obj = {
      "fileData": File = null, "textField": '', "imagePreview": '', "fileName": '', "imageId": ''
    }

    this.imageData.push(obj);
  }

  removeImage(event, index) {
    event.preventDefault()
    this.imageData[index].imagePreview = '';
    this.imageData[index].fileData = File = null;
    this.imageData[index].fileData = ''
  }

  fileProgress(fileInput: any, index) {
    // this.submission = false;
    this.imageData[index].fileData = <File>fileInput.target.files[0];
    this.imageData[index].fileName = fileInput.target.files[0].name;
    this.imageData[index].isSave = false

    var reader = new FileReader();
    reader.onload = (event: any) => {
      this.imageData[index].imagePreview = reader.result;

    }
    reader.readAsDataURL(fileInput.target.files[0]);
  }

  listPath() {
    this.router.navigateByUrl('/inspection-report?back=true')
  }
}