import { Component, OnInit ,EventEmitter ,Input ,Output} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService } from '../../../services/api.service'
import { environment } from "src/environments/environment";
import { Location } from '@angular/common';
import { ModalDialogService } from 'src/app/services';
import * as moment from 'moment';

@Component({
  selector: 'app-add-issues',
  templateUrl: './add-issues.component.html',
  styleUrls: ['./add-issues.component.scss']
})
export class AddIssuesComponent implements OnInit {

  submitted = false
  issuesReportForm: FormGroup
  imagePreviewUrl: any = [];
  imgUrl;
  imageData = [];
  projectId = '';
  submission = false;
  respData
  projectTitle
  issueTitle
  issueTableData = []
  tableShow;
  verifyFlag = false;
  @Input() ISSUEID: string;
  @Input() ISSUE: string;

  @Output() Projects: EventEmitter<any> = new EventEmitter();

  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private fb: FormBuilder, private toastr: ToastrManager, private api: ApiService,
    private location: Location, private modalDialogService: ModalDialogService) {
    this.imgUrl = environment.image_url
  }

  ngOnInit() {
    // this.activatedRoute.params.subscribe((params: Params) => {
    //   this.projectId = params.projectId ? params.projectId : ''
    // });
   
    let DocId :any= sessionStorage.getItem("ProjectId");
    if(DocId && this.ISSUE=='issue-add')
    {
       let datas = JSON.parse(DocId);
       this.projectId = datas.id;
    }
    else{
      this.projectId = this.ISSUEID ? this.ISSUEID :'';
    }
    this.imageData = [
      {
        "fileData": File = null, "textField": '', "imagePreview": '', "fileName": '', "imageId": ''
      }
    ]

    if (this.projectId) {
      this.editList({ id: this.projectId }, true)
    }
  }
  issuesVerified(id)
  { 
    let param;
      if(id)
      {
         param = {
          pointMapId:id,
          type:'issue'
        }

      }

      this.modalDialogService.confirm("Confirm Delete", "verify this issue?", "Confirm", "Cancel").subscribe(result => {
        if (result) {
          this.api.post('shared/verifyInspection',param).subscribe(resp => {
            if (resp.status == 200) {
              this.toastr.successToastr("Verified")
              // this.getIssueReport()
              this.editList({ id: this.projectId }, true);
            }
          })
        }
      })
   
  }
  editList(options, isEdit) { //OnChange DropDown OR Edit List
    let id = '';
    if (isEdit) {
      id = options.id
    }
    if (!isEdit) {
      id = options.item_id
    }
    this.api.get('shared/getIssues?projectId=' + id).subscribe(resp => {
      this.projectTitle = resp.data.rows[0].title
      if (resp && resp.status == "200" && resp.data && resp.data.rows && resp.data.rows[0] && resp.data.rows[0].ProjectIssues.length > 0) {
        this.respData = resp.data.rows[0];
        let arry = [];
        console.log(this.respData,"RESP");
        let obj ={};
        this.respData.ProjectIssues && this.respData.ProjectIssues.map((item, index) => {
         obj = {
            textField: item.title,
            imagePreview: this.imgUrl + item.defectPath + item.defectImage,
            fileName: item.defectImage,
            imageId: item.id,
            isSave: true,
            description: item.description,
            status: item.status,
            verifyDate:item.verifyDate
          }   
         
         
          arry.push(obj);


        })
        
      
        if (arry.length > 0) {
          this.imageData = [];
          this.imageData = arry;
          this.issueTableData = arry;
        }
      } else {
        this.imageData = [
          {
            "fileData": File = null, "textField": '', "imagePreview": '', "fileName": '', "imageId": ''
          }
        ]
      }
    })
  }
  convertDateFormat(date)
  {
    let dateTime ;
    let dates = moment(date).format('D/M/YYYY, h:mm a');
    dateTime = dates && dates.split(",");
    return dateTime;
  }
  onExport(){
  }
  onImageClick(i) {
    this.issueTitle = "Block " + (i + 1)
    if (this.respData && this.respData.ProjectIssues && this.respData.ProjectIssues.length > 0) {
      this.tableShow = true
      this.issueTableData = this.respData.ProjectIssues
    }
    else {
      this.issueTableData = []
      this.tableShow = false
      this.toastr.errorToastr("No Datas Found")
    }
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
    this.router.navigateByUrl('/issues?back=true')
  }
}