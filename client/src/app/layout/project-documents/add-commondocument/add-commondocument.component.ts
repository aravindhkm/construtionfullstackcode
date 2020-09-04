import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrManager, Toastr } from 'ng6-toastr-notifications';
import { ApiService } from '../../../services/api.service'
import { HttpClient } from '@angular/common/http';
import { ModalDialogService } from 'src/app/services';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';

@Component({
  selector: 'app-add-commondocument',
  templateUrl: './add-commondocument.component.html',
  styleUrls: ['./add-commondocument.component.scss']
})
export class AddCommondocumentComponent implements OnInit {
  submitted = false
  createDocumentForm: FormGroup
  record;
  voRecord;
  defaultRecord;
  names;
  voNames;
  id;
  claimsTitle
  claimsRecord
  tdsRecord
  tdsTitle
  projectLists: any = [];
  dropdownSettings: any = {}
  dropdownSettingsEdit: any = {}
  fileData: any = [];
  respData = []
  folderData = []
  projectDocumentsTitle
  baseUrl;
  createdAtId;
  @Input() SOIId: string;
  @Input() SOI: string;
  @Input() TDSId: string;
  @Input() TDS: string;
  @Input() CLAIMID: string;
  @Input() CLAIM: string;
  @Output() filevent: EventEmitter<any> = new EventEmitter();

  constructor(private activatedRoute: ActivatedRoute, private router: Router,
    private fb: FormBuilder, private toastr: ToastrManager, private api: ApiService,
    private http: HttpClient, private modalDialogService: ModalDialogService) {
  }
  ngOnInit() {
    this.baseUrl = environment.api_url
    this.dropDownSettings();
    this.createDocumentForm = this.fb.group({
      projectData: [{ value: '', disabled: true }, Validators.required], images: [], file: ['', Validators.required]
    })
    let DocId: any = sessionStorage.getItem("ProjectId");


    if (this.SOI || this.SOIId) {
      if (this.SOI == 'soi-add' && DocId) {
        let datas = JSON.parse(DocId);
        this.projectDocumentsTitle = "soi";
        this.createDocumentForm = this.fb.group({
          projectData: [{ value: datas.name, disabled: true }, Validators.required], images: [], file: ['', Validators.required]
        })
        this.createdAtId = datas.id;
      }
      else {
        this.projectDocumentsTitle = "soi";
        this.id = this.SOIId ? this.SOIId : '';
      }

    }
    else if (this.TDS || this.TDSId) {
      if (this.TDS == 'tds-add' && DocId) {
        let datas = JSON.parse(DocId);
        this.projectDocumentsTitle = "tds";
        this.createdAtId = datas.id;
        this.createDocumentForm = this.fb.group({
          projectData: [{ value: datas.name, disabled: true }, Validators.required], images: [], file: ['', Validators.required]
        })
      }
      else {
        this.projectDocumentsTitle = "tds";
        this.id = this.TDSId ? this.TDSId : '';
      }

    }
    else {
      if (this.CLAIM == 'claims-add' && DocId) {
        let datas = JSON.parse(DocId);
        this.projectDocumentsTitle = "claims";
        this.createdAtId = datas.id;
        this.createDocumentForm = this.fb.group({
          projectData: [{ value: datas.name, disabled: true }, Validators.required], images: [], file: ['', Validators.required]
        })
      }
      if (this.CLAIM || this.CLAIMID) {
        this.projectDocumentsTitle = "claims";
        this.id = this.CLAIMID ? this.CLAIMID : '';
      }
    }
    // this.activatedRoute.params.subscribe((params: Params) => {
    //   let title = params
    //   this.projectDocumentsTitle = title.soi == "soi" ? "soi" : title.soi == "tds" ? "tds" : "claims";
    //   this.id = params.id ? params.id : ''
    // })
    this.defaultRecord = [];
    this.record = [];
    // [{ 'file': File = null,fileName: '',  actionId: '1'},{ 'file': File, fileName: '', actionId: '2' }],
    this.voRecord = []
    this.voNames = this.projectDocumentsTitle == 'soi' ? [{ 'name': 'VO Documents' }] : [{ 'name': 'TDS Documents' }]
    this.names = [[{ 'name': 'SOI Documents' }, { 'name': 'VO Documents' }, { 'name': 'Others' }, { 'name': 'Remarks' }]]
    this.claimsRecord = []
    this.claimsTitle = []
    this.tdsRecord = []
    this.tdsTitle = []

    this.getDocuments({}); //this.getEditList() called inside this function
    // this.getProject();
  }
  get f() {
    return this.createDocumentForm.controls
  }
  dropDownSettings() {
    this.dropdownSettings = {
      singleSelection: true,
      text: "Select Project",
      enableSearchFilter: true,
      enableFilterSelectAll: false,
      classes: "myclass custom-class tick-box",
      showCheckbox: true,
      showSelectedItemsAtTop: false,
      position: "bottom",
      disabled: "true"
    };
    this.dropdownSettingsEdit = {
      singleSelection: true,
      text: "Select Project",
      enableSearchFilter: true,
      enableFilterSelectAll: false,
      classes: "myclass custom-class tick-box",
      showCheckbox: true,
      showSelectedItemsAtTop: false,
      disabled: "true"
    }
  }
  getProject() { //Get DropDown List
    this.api.get('projects/listProjects').subscribe(resp => {
      if (resp && resp.status == "200" && resp.data) {
        let DDList = [];
        resp.data.map(item => {
          let obj = { "id": item.id, "itemName": item.title }
          DDList.push(obj);
        })
        this.projectLists = DDList;
      }
    })
  }
  getDocuments(options) { //Get Basics Fields and (Edit List OR Dates Filter datas) 
    if (this.id) {
      this.onItemSelect({ "id": this.id }, true)
    }
    // else {
    let defaultArray = [{ 'file': File = null, fileName: [], actionId: '1', filePath: [], type: 'soi', name: 'soi documents-1',remarks:'' },
    { 'file': File = null, fileName: [], actionId: '2', filePath: [], type: 'vo', name: 'soi documents-1',remarks:'' }, { 'file': File = null, fileName: [], actionId: '3', filePath: [], type: 'others', name: 'soi documents-1',remarks:'' },{ 'file': File = null, fileName: [], actionId: '4', filePath: [], type: 'others', name: 'soi documents-1',remarks:'' }]

    this.record.push(defaultArray)
    this.voRecord = [[{ 'file': File = null, fileName: [], actionId: '1' }, { 'file': File = null, fileName: '', actionId: '2' }]]
    this.claimsTitle = [[{ 'name': 'Claims Schedule' }, { 'name': 'Progress Report' }, { 'name': 'Payment Certificate' }, { 'name': 'Others' }]];
    this.claimsRecord = [[{ 'file': File, fileName: [], actionId: '1', placeHolder: 'Claims Schedule', filePath: [], name: 'claims documents-1' }, { 'file': File, fileName: [], actionId: '2', placeHolder: 'Progress Report', filePath: [], name: 'claims documents-1' }, { 'file': File, fileName: [], actionId: '3', placeHolder: 'Payment Certificate', filePath: [], name: 'claims documents-1' }, { 'file': File, fileName: [], actionId: '3', placeHolder: 'Others', filePath: [], name: 'claims documents-1' }]];
    this.tdsTitle = [[{ "name": "Product Name" }, { "name": "TDS Documents" }, { "name": "MSDS Documents" }, { "name": "Others" }]]
    this.tdsRecord = [[{ 'file': File = null, fileName: '', actionId: '1', placeHolder: 'Product Name', productName: '' }, { 'file': File = null, fileName: [], actionId: '2', placeHolder: 'TDS Documents', filePath: [], productName: '' }, { 'file': File = null, fileName: [], actionId: '2', placeHolder: 'MSDS Documents', filePath: [], productName: '' }, { 'file': File = null, fileName: [], actionId: '2', placeHolder: 'Others', filePath: [], productName: '' }]]
    // }
  }
  productNameChange(event, index, subIndex,type) {
    if(type == 'tds'){
    for (let i = 0; i < this.tdsRecord[index].length; i++) {
      this.tdsRecord[index][i].productName = event.target.value
    }
    this.tdsRecord[index][subIndex].flag = true
  }
  else{
    for (let i = 0; i < this.record[index].length; i++) {
      this.record[index][i].remarks = event.target.value
    }
    this.record[index][subIndex].flag = true
  }
  }
  onEachFileRemove(mainIndex, subIndex, labelIndex, documentId, type) {
    if (type == 'soi') {
      this.record[mainIndex][subIndex].fileName.splice(labelIndex, 1)
      this.record[mainIndex][subIndex].filePath.splice(labelIndex, 1)
      this.record[mainIndex][subIndex].fileName.length == 0 ? this.names[mainIndex][subIndex].flag=false : ''
      documentId ? this.api.delete('documents/deleteDocument?mapId=' + documentId + '&documents=' + this.record[mainIndex][subIndex].fileName).subscribe(resp => { }) : ''
    }
    else if (type == 'tds') {
      this.tdsRecord[mainIndex][subIndex].fileName.splice(labelIndex, 1)
      this.tdsRecord[mainIndex][subIndex].fileName.length == 0 ? this.tdsTitle[mainIndex][subIndex].flag=false : ''
      documentId ? this.api.delete('documents/deleteDocument?mapId=' + documentId + '&documents=' + this.tdsRecord[mainIndex][subIndex].fileName).subscribe(resp => { }) : ''
    }
    else {
      this.claimsRecord[mainIndex][subIndex].fileName.splice(labelIndex, 1)
      this.claimsRecord[mainIndex][subIndex].fileName.length == 0 ? this.claimsTitle[mainIndex][subIndex].flag=false : ''
      documentId ? this.api.delete('documents/deleteDocument?mapId=' + documentId + '&documents=' + this.claimsRecord[mainIndex][subIndex].fileName).subscribe(resp => { }) : ''
    }
  }
  onItemSelect(options, isEdit) { //OnChange DropDown OR Edit List
    let id = '';
    if (isEdit) {
      this.createDocumentForm.controls['projectData'].setValue([])
      options.length == 0 ? id = '' : id = options.id
    }
    if (!isEdit) {
      id = options.id
    }
    this.submitted = id ? true : false
    this.api.get('documents/list?projectId=' + id + '&type=' + this.projectDocumentsTitle).subscribe(resp => {
      if (id && resp && resp.status == "200" && resp.data && resp.data.rows && resp.data.rows[0]) {

        this.respData = resp.data.rows;
        let documentsData = resp.data.rows[0] && resp.data.rows[0].ProjectDocuments;
        let claimsData = resp.data.rows[0]
        this.createDocumentForm = this.fb.group({
          projectData: [{ value: this.respData[0].title, disabled: true }, Validators.required], file: [documentsData[0].documentName, Validators.required]
        })
        this.dropDownSettings();
        this.claimsRecord = []
        this.tdsRecord = []
        this.tdsTitle = []
        this.claimsTitle = []
        this.record = []
        this.names = []
        this.projectDocumentsTitle == 'soi' && claimsData.ProjectDocuments && claimsData.ProjectDocuments.map((claimItem, claimIndex) => {
          this.names.push([{ 'name': 'SOI Documents' }, { 'name': 'VO Documents' }, { 'name': 'Others' },{ 'name': 'Remarks' }])
          this.record.push([{ 'file': File = null, fileName: [], actionId: '1', filePath: [], type: 'soi', name:claimItem.name ,remarks:'' },
          { 'file': File = null, fileName: [], actionId: '2', filePath: [], type: 'vo', name:claimItem.name,remarks:'' }, { 'file': File = null, fileName: [], actionId: '3', filePath: [], type: 'others', name:claimItem.name,remarks:'' },{ 'file': File = null, fileName: [], actionId: '1', filePath: [], type: 'soi', name:claimItem.name,remarks:'' }])
          claimItem.ProjectDocumentMaps.map((subItem, subIndex) => {
            if (subItem.documentType == 'soi') {
              let date = moment(subItem.createdAt).format('D/M/YYYY, h:mm a');
              let dateTime = date && date.split(",");
              this.record[claimIndex][0].uploadTime=dateTime[0] + " " + dateTime[1]
              this.record[claimIndex][0].fileName = subItem.documentName
              this.record[claimIndex][0].actionId = subIndex
              this.record[claimIndex][0].documentId = subItem.id
              this.record[claimIndex][0].id = claimItem.id,
                this.record[claimIndex][0].baseUrl = this.baseUrl,
                this.record[claimIndex][0].file = null,
                this.record[claimIndex][0].documentType = subItem.documentType
               subItem.documentName.length != 0 ? this.names[claimIndex][0].flag=true : ''
            }
            else if (subItem.documentType == 'vo') {
              let date = moment(subItem.createdAt).format('D/M/YYYY, h:mm a');
              let dateTime = date && date.split(",");
              this.record[claimIndex][1].uploadTime=dateTime[0] + " " + dateTime[1]
              this.record[claimIndex][1].fileName = subItem.documentName
              this.record[claimIndex][1].actionId = subIndex
              this.record[claimIndex][1].documentId = subItem.id
              this.record[claimIndex][1].id = claimItem.id,
                this.record[claimIndex][1].baseUrl = this.baseUrl,
                this.record[claimIndex][1].file = null,
              this.record[claimIndex][1].documentType = subItem.documentType
              subItem.documentName.length != 0 ? this.names[claimIndex][1].flag=true : ''
            }
            else {
              let date = moment(subItem.createdAt).format('D/M/YYYY, h:mm a');
              let dateTime = date && date.split(",");
              this.record[claimIndex][2].uploadTime=dateTime[0] + " " + dateTime[1]
              this.record[claimIndex][2].fileName = subItem.documentName
              this.record[claimIndex][2].actionId = subIndex
              this.record[claimIndex][2].documentId = subItem.id
              this.record[claimIndex][2].id = claimItem.id,
                this.record[claimIndex][2].baseUrl = this.baseUrl,
                this.record[claimIndex][2].file = null,
              this.record[claimIndex][2].documentType = subItem.documentType
              subItem.documentName.length != 0 ? this.names[claimIndex][2].flag=true : ''
            }
            this.record[claimIndex][3].id = claimItem.id
            for(let i=0;i <= 3;i++){
            this.record[claimIndex][i].remarks = claimItem.remarks
            }
          })
        })

        this.projectDocumentsTitle == 'claims' && claimsData.ProjectDocuments && claimsData.ProjectDocuments.map((claimItem, claimIndex) => {
          this.claimsTitle.push([{ 'name': 'Claims Schedule' }, { 'name': 'Progress Report' }, { 'name': 'Payment Certificate' }, { 'name': 'Others' }])
          this.claimsRecord.push([{ 'file': File, fileName: [], actionId: '1', placeHolder: 'Claims Schedule', filePath: [], name:claimItem.name  }, { 'file': File, fileName: [], actionId: '2', placeHolder: 'Progress Report', filePath: [], name:claimItem.name }, { 'file': File, fileName: [], actionId: '3', placeHolder: 'Payment Certificate', filePath: [], name:claimItem.name }, { 'file': File, fileName: [], actionId: '3', placeHolder: 'Others', filePath: [], name:claimItem.name }])
          claimItem.ProjectDocumentMaps.length > 0 && claimItem.ProjectDocumentMaps.map((subItem, subIndex) => {
            let date = moment(subItem.createdAt).format('D/M/YYYY, h:mm a');
            let dateTime = date && date.split(",");
            this.claimsRecord[claimIndex][subIndex].uploadTime=dateTime[0] + " " + dateTime[1]
            this.claimsRecord[claimIndex][subIndex].fileName = subItem.documentName
            this.claimsRecord[claimIndex][subIndex].actionId = subIndex
            this.claimsRecord[claimIndex][subIndex].documentId = subItem.id
            this.claimsRecord[claimIndex][subIndex].id = claimItem.id,
              this.claimsRecord[claimIndex][subIndex].baseUrl = this.baseUrl,
              this.claimsRecord[claimIndex][subIndex].file = null,
              this.claimsRecord[claimIndex][subIndex].documentType = subItem.documentType
            this.claimsRecord[claimIndex][subIndex].productName = claimItem.documentName
            subItem.documentName.length != 0 ? this.claimsTitle[claimIndex][subIndex].flag=true : ''
          })
        })
        this.projectDocumentsTitle == 'tds' && claimsData.ProjectDocuments && claimsData.ProjectDocuments.map((claimItem, claimIndex) => {
          this.tdsTitle.push([{ "name": "Product Name" }, { "name": "TDS Documents" }, { "name": "MSDS Documents" }, { "name": "Others" }])
          this.tdsRecord.push([{ 'file': File = null, fileName: '', actionId: '1', placeHolder: 'Product Name', productName:claimItem.documentName }, { 'file': File = null, fileName: [], actionId: '2', placeHolder: 'TDS Documents', filePath: [], productName: claimItem.documentName }, { 'file': File = null, fileName: [], actionId: '2', placeHolder: 'MSDS Documents', filePath: [], productName:claimItem.documentName }, { 'file': File = null, fileName: [], actionId: '2', placeHolder: 'Others', filePath: [], productName: claimItem.documentName }])
          claimItem.ProjectDocumentMaps.map((subItem, subIndex) => {
            if (subItem.documentType == 'tds') {
              let date = moment(subItem.createdAt).format('D/M/YYYY, h:mm a');
              let dateTime = date && date.split(",");
              this.tdsRecord[claimIndex][1].uploadTime=dateTime[0] + " " + dateTime[1]
              this.tdsRecord[claimIndex][1].fileName = subItem.documentName
              this.tdsRecord[claimIndex][1].actionId = subIndex
              this.tdsRecord[claimIndex][1].documentId = subItem.id
              this.tdsRecord[claimIndex][1].id = claimItem.id,
                this.tdsRecord[claimIndex][1].baseUrl = this.baseUrl,
                this.tdsRecord[claimIndex][1].file = null,
                this.tdsRecord[claimIndex][1].documentType = subItem.documentType
                this.tdsTitle[claimIndex][1].flag=true
            }
            else if (subItem.documentType == 'msds') {
              let date = moment(subItem.createdAt).format('D/M/YYYY, h:mm a');
              let dateTime = date && date.split(",");
              this.tdsRecord[claimIndex][2].uploadTime=dateTime[0] + " " + dateTime[1]
              this.tdsRecord[claimIndex][2].fileName = subItem.documentName
              this.tdsRecord[claimIndex][2].actionId = subIndex
              this.tdsRecord[claimIndex][2].documentId = subItem.id
              this.tdsRecord[claimIndex][2].id = claimItem.id,
                this.tdsRecord[claimIndex][2].baseUrl = this.baseUrl,
                this.tdsRecord[claimIndex][2].file = null,
                this.tdsRecord[claimIndex][2].documentType = subItem.documentType
                this.tdsTitle[claimIndex][2].flag=true
            }
            else {
              let date = moment(subItem.createdAt).format('D/M/YYYY, h:mm a');
              let dateTime = date && date.split(",");
              this.tdsRecord[claimIndex][3].uploadTime=dateTime[0] + " " + dateTime[1]
              this.tdsRecord[claimIndex][3].fileName = subItem.documentName
              this.tdsRecord[claimIndex][3].actionId = subIndex
              this.tdsRecord[claimIndex][3].documentId = subItem.id
              this.tdsRecord[claimIndex][3].id = claimItem.id,
                this.tdsRecord[claimIndex][3].baseUrl = this.baseUrl,
                this.tdsRecord[claimIndex][3].file = null,
                this.tdsRecord[claimIndex][3].documentType = subItem.documentType
                this.tdsTitle[claimIndex][3].flag=true
            }
            for(let i=0;i <= 3;i++){
            this.tdsRecord[claimIndex][i].productName = claimItem.documentName
            this.tdsRecord[claimIndex][i].id = claimItem.id
            }
            this.tdsRecord[claimIndex][0].documentType = subItem.documentType
          })
        })
      }
      else {
        let DocId: any = sessionStorage.getItem("ProjectId");
        let DId: any = sessionStorage.getItem("EditProjectId");
        if (DocId && this.SOI && this.SOI == 'soi-add' || DocId && this.TDS && this.TDS == 'tds-add' || DocId && this.CLAIM && this.CLAIM == 'claims-add') {
          let datas = JSON.parse(DocId);
          this.createDocumentForm = this.fb.group({
            projectData: [{ value: datas.name, disabled: true }, Validators.required],
            images: [], file: ['', Validators.required]
          })
        }
        else {
          if (DId){
            let datas = JSON.parse(DId);
            this.createDocumentForm = this.fb.group({
              projectData: [{value: datas.name, disabled: true}, Validators.required],
              images: [], file: ['', Validators.required]
            })
          }
        }
        this.createDocumentForm.controls['file'].setValue('')
        this.record = []
        this.voRecord = []
        let defaultArray = [{ 'file': File = null, fileName: [], actionId: '1', filePath: [], type: 'soi', name: 'soi documents-1',remarks:'' }, { 'file': File = null, fileName: [], actionId: '2', filePath: [], type: 'vo', name: 'soi documents-1',remarks:'' }, { 'file': File = null, fileName: [], actionId: '3', filePath: [], type: 'others', name: 'soi documents-1',remarks:'' }, { 'file': File = null, fileName: '', actionId: '4', filePath: [], type: 'others', name: 'soi documents-1',remarks:'' }]
        this.record.push(defaultArray)
        this.voRecord = [[{ 'file': File = null, fileName: '', actionId: '1' }, { 'file': File = null, fileName: '', actionId: '2' }]]
        this.claimsTitle = [[{ 'name': 'Claims Schedule' }, { 'name': 'Progress Report' }, { 'name': 'Payment Certificate' }, { 'name': 'Others' }]]
        this.claimsRecord = [[{ 'file': File = null, fileName: [], actionId: '1', placeHolder: 'Claims Schedule', filePath: [], name: 'claims documents-1' }, { 'file': File = null, fileName: [], actionId: '2', placeHolder: 'Progress Report', filePath: [], name: 'claims documents-1' }, { 'file': File = null, fileName: [], actionId: '3', placeHolder: 'Payment Certificate', filePath: [], name: 'claims documents-1' }, { 'file': File = null, fileName: [], actionId: '3', placeHolder: 'Others', filePath: [], name: 'claims documents-1' }]]
        this.tdsTitle = [[{ "name": "Product Name" }, { "name": "TDS Documents" }, { "name": "MSDS Documents" }, { "name": "Others" }]]

        this.tdsRecord = [[{ 'file': File = null, fileName: '', actionId: '1', productName: '' }, { 'file': File = null, fileName: [], actionId: '2', filePath: [], productName: '' }, { 'file': File = null, fileName: [], actionId: '3', filePath: [], productName: '' }, { 'file': File = null, fileName: [], actionId: '4', filePath: [], productName: '' }]]
      }
    })
  }
  AddAnotherField(type) { //Add another Field
    if (type == 'soi') {
      let value = this.record[this.record.length - 1]
      let count = value[0] && value[0].name && value[0].name.split('-')
      let soiField = [{ 'file': File, fileName: [], actionId: count + 1, filePath: [], type: 'soi', name: 'soi documents-' + (Number(count[1]) + 1) ,remarks:'' }, { 'file': File, fileName: [], actionId: count + 1, filePath: [], type: 'vo', name: 'soi documents-' + (Number(count[1]) + 1) ,remarks:'' }, { 'file': File, fileName: [], actionId: count + 1, filePath: [], type: 'others', name: 'soi documents-' + (Number(count[1]) + 1) ,remarks:'' },{ 'file': File, fileName: '', actionId: count + 1, filePath: [], type: 'others', name: 'soi documents-' + (Number(count[1]) + 1) ,remarks:''}];
      let nameField = [{ name: 'SOI Documents' }, { name: 'VO Documents' }, { name: 'Others' },{name:'Remarks'}]
      this.names.push(nameField);
      this.record.push(soiField);
    }
    else if (type == 'tds') {
      let NameField = [{ 'name': 'Product Name' }, { 'name': 'TDS Documents' }, { 'name': 'MSDS Documents' }, { 'name': 'Others' }];
      let voField = [{ 'file': File, fileName: '', actionId: '1', placeHolder: 'Product Name', productName: '',filePath:[] }, { 'file': File, fileName: [], actionId: '1', placeHolder: 'TDS Documents', filePath: [] }, { 'file': File, fileName: [], actionId: '1', placeHolder: 'MSDS Documents', filePath: [] }, { 'file': File, fileName: [], actionId: '1', placeHolder: 'Others', filePath: [] }];
      this.tdsRecord.push(voField);
      this.tdsTitle.push(NameField)
    }
    else {
      let value = this.claimsRecord[this.claimsRecord.length - 1]
      let count = value[0] && value[0].name && value[0].name.split('-')
      let NameField = [{ 'name': 'Claims Schedule' }, { 'name': 'Progress Report' }, { 'name': 'Payment Certificate' }, { 'name': 'Others' }];
      let Field = [{ 'file': File, fileName: [], actionId: '1', placeHolder: 'Claims Schedule', filePath: [], name: 'claims documents-' + (Number(count[1]) + 1) }, { 'file': File, fileName: [], actionId: '2', placeHolder: 'Progress Report', filePath: [], name: 'claims documents-' + (Number(count[1]) + 1) }, { 'file': File, fileName: [], actionId: '3', placeHolder: 'Payment Certificate', filePath: [], name: 'claims documents-' + (Number(count[1]) + 1) }, { 'file': File, fileName: [], actionId: '3', placeHolder: 'Others', filePath: [], name: 'claims documents-' + (Number(count[1]) + 1) }];
      this.claimsTitle.push(NameField)
      this.claimsRecord.push(Field);
    }
  }
  removeTdsFields(index, Data, type) {
    this.modalDialogService.confirm("Confirm Remove", "Are you sure you want to remove ?", "Confirm", "Cancel").subscribe(result => {
      if (result) {
        if (type == "claims" && this.id) {
          let documentId = Data[0].id ? Data[0].id : ''
          if (documentId) {
            this.api.delete('documents/deleteDocument?documentId=' + documentId + '&projectId=' + this.id + '&type=' + type).subscribe(resp => {
              if (resp.status == 200) {
                this.claimsTitle.splice(index, 1);
                this.claimsRecord.splice(index, 1);
                this.toastr.successToastr("Field Removed success")
              }
            })
          } else {
            this.claimsRecord.splice(index, 1);
            this.claimsTitle.splice(index, 1)
            this.toastr.successToastr("Field Removed success")
          }

        }
        else if (type == 'tds' && this.id) {
          let documentId = Data[0].id ? Data[0].id : ''
          if (documentId) {
            this.api.delete('documents/deleteDocument?documentId=' + documentId + '&projectId=' + this.id).subscribe(resp => {
              if (resp.status == "200") {
                this.tdsTitle.splice(index, 1);
                this.tdsRecord.splice(index, 1);
                this.toastr.successToastr("Field Removed success")
              }
            })
          } else {
            this.tdsRecord.splice(index, 1);
            this.tdsTitle.splice(index, 1)
            this.toastr.successToastr("Field Removed success")
          }
        }
        else {
          this.claimsRecord.splice(index, 1)
          this.claimsTitle.splice(index, 1)
          this.tdsTitle.splice(index, 1)
          this.tdsRecord.splice(index, 1)
          this.toastr.successToastr("Field Removed success")
        }
      }
    })
  }
  removeField(index, Data, type) { // Remove Particular Field
    this.modalDialogService.confirm("Confirm Remove", "Are you sure you want to remove ?", "Confirm", "Cancel").subscribe(result => {
      if (result) {
        if (type == 'soi' && this.id) {
          let documentId = Data[0].id ? Data[0].id : ''
          if (documentId) {
            this.api.delete('documents/deleteDocument?documentId=' + documentId + '&projectId=' + this.id + '&type=' + type).subscribe(resp => {
              if (resp.status == "200") {
                this.record.splice(index, 1);
                this.names.splice(index, 1)
              }
            })
          }
          else {
            this.record.splice(index, 1);
            this.names.splice(index, 1)
          }
          this.toastr.successToastr("Field Removed success")
        }
        else if (type == 'vo' && this.id) {
          let documentId = Data[index].documentId ? Data[index].documentId : ''
          documentId ? this.api.delete('documents/deleteDocument?documentId=' + documentId + '&projectId=' + this.id + '&type=' + type).subscribe(resp => {
            if (resp.status == "200") { this.voRecord[0].splice(index, 1); }
          }) : this.voRecord[0].splice(index, 1);
          this.toastr.successToastr("Field Removed success")
        }
        else {
          // type == 'soi' ? this.record[0].splice(index, 1) : this.voRecord[0].splice(index, 1)
          this.record.splice(index, 1)
          this.names.splice(index, 1)
          this.toastr.successToastr("Field Removed success")
        }
      }
    })
  }

  uploadDocument(mainId, subId, fileInput: any, data, type) {
    let filesAmount = fileInput.target.files.length;
    if (type == 'soi') {
      for (let i = 0; i < filesAmount; i++) {
        this.record[mainId][subId].filePath.push(<File>fileInput.target.files[i])
        this.record[mainId][subId].file = <File>fileInput.target.files[i]
        this.record[mainId][subId].fileName.push(<File>fileInput.target.files[i].name)

      }
      let currentDate = new Date();
      let date = moment(currentDate).format('D/M/YYYY, h:mm a');
      let dateTime = date && date.split(",");
      this.record[mainId][subId].uploadTime = dateTime[0] + " " + dateTime[1]
      let file = fileInput.target.files[0]
      this.createDocumentForm.controls['file'].setValue(file ? file.name : '')
      this.names[mainId][subId].flag=true
    }
    else if (type == 'tds') {
      let file = fileInput.target.files[0]
      this.createDocumentForm.controls['file'].setValue(file ? file.name : '')

      for (let i = 0; i < filesAmount; i++) {
        this.tdsRecord[mainId][subId].filePath.push(<File>fileInput.target.files[i])
        this.tdsRecord[mainId][subId].file = <File>fileInput.target.files[i]
        this.tdsRecord[mainId][subId].fileName.push(<File>fileInput.target.files[i].name)
      }
      let currentDate = new Date();
      let date = moment(currentDate).format('D/M/YYYY, h:mm a');
      let dateTime = date && date.split(",");
      this.tdsRecord[mainId][subId].uploadTime = dateTime[0] + " " + dateTime[1]
      this.tdsTitle[mainId][subId].flag=true
    }
    else {
      let file = fileInput.target.files[0]
      this.createDocumentForm.controls['file'].setValue(file ? file.name : '')


      for (let i = 0; i < filesAmount; i++) {
        this.claimsRecord[mainId][subId].filePath.push(<File>fileInput.target.files[i])
        this.claimsRecord[mainId][subId].file = <File>fileInput.target.files[i]
        this.claimsRecord[mainId][subId].fileName.push(<File>fileInput.target.files[i].name)
      }
      let currentDate = new Date();
      let date = moment(currentDate).format('D/M/YYYY, h:mm a');
      let dateTime = date && date.split(",");
      this.claimsRecord[mainId][subId].uploadTime = dateTime[0] + " " + dateTime[1]
      this.claimsTitle[mainId][subId].flag=true
    }
    fileInput.target.value=''
  }

  listPath() {
    // this.projectDocumentsTitle == "soi" ? this.router.navigateByUrl('/documents/soi?back=true') :
    //   this.projectDocumentsTitle == "tds" ? this.router.navigateByUrl('/documents/tds?back=true') : this.router.navigateByUrl('/documents/claims?back=true')
    this.filevent.emit();
  }

  onSubmit() {
    this.submitted = true
    let formValues = this.createDocumentForm.value
    let flag = true
    if(this.projectDocumentsTitle == 'soi'){
    for (let i = 0; i < this.record.length; i++) {
      if (this.record[i][0].fileName.length == 0 && this.record[i][0].filePath.length == 0) {
        flag = false
        break;
      }
    }
  }
  if(this.projectDocumentsTitle == 'tds'){
    for (let i = 0; i < this.tdsRecord.length; i++) {
      if (this.tdsRecord[i][0].productName == '') {
        flag = false
        break;
      }
    }
  }
    if (this.id && flag || this.createdAtId && flag) {
      let CreatedId = this.id ? this.id : this.createdAtId;
      let projectId = CreatedId;
      let formDataVal = new FormData();
      let Data = [];
      let obj = {}
      let voObj = {}
      this.record && this.record.map((item, index) => {
        item.map((subItem, subIndex) => {
          if (subItem.file || subItem.flag && subItem.fileName.length != 0) {
            for (let i = 0; i < subItem.filePath.length; i++) {
              formDataVal.append("documents", subItem.filePath[i]);
            }
            obj = {
              "projectId": projectId,
              // "type": this.projectDocumentsTitle == 'soi' ? "soi" : "msds",
              'fileName': subItem.fileName,
              'actionType': 'multiple',
              'name': subItem.name,
              'remarks':subItem.remarks
            };
            subIndex == 0 ? obj['type'] = 'soi' : subIndex == 1 ? obj['type'] = 'vo' : obj['type'] = 'others-soi'
            subItem.flag ? obj['documentId'] = subItem.id : ''
            Data.push(obj);
          }
          else if(subIndex == 3 && subItem.flag){
            obj = {
              "projectId": projectId,
              'documentId':subItem.id,
              'remarks':subItem.remarks,
              'name': subItem.name,
            }
            Data.push(obj);
          }
        })
      })
      this.voRecord && this.voRecord.map((item, index) => {
        item.map((subItem, subIndex) => {
          if (subItem.file) {
            formDataVal.append("documents", subItem.file);
            voObj = {
              "projectId": projectId,
              "type": this.projectDocumentsTitle == 'soi' ? "vo" : "tds",
              'fileName': subItem.fileName,
              'actionType': subItem.documentId ? 'multiple' : 'single',
              'name': subItem.productName
            };
            Data.push(voObj);
          }
        })
      })
      this.claimsRecord && this.claimsRecord.map((item, index) => {
        item.map((subItem, subIndex) => {
          if (subItem.file && subItem.fileName.length != 0) {
            for (let i = 0; i < subItem.filePath.length; i++) {
              formDataVal.append("documents", subItem.filePath[i]);
            }
            obj = {
              "projectId": projectId,
              // "type": this.projectDocumentsTitle,
              'fileName': subItem.fileName,
              'actionType': 'multiple',
              'name': subItem.name
            }
            subIndex == 3 ? obj['type'] = 'others-claims' : obj['type'] = 'claims'
            Data.push(obj);
          }
        })
      })
      this.tdsRecord && this.tdsRecord.map((item, index) => {
        item.map((subItem, subIndex) => {
          if (subItem.file || subItem.flag && subItem.fileName.length != 0) {
            for (let i = 0; i < subItem.filePath.length; i++) {
              formDataVal.append("documents", subItem.filePath[i]);
            }
            obj = {
              "projectId": projectId,
              // "type": this.projectDocumentsTitle,
              // 'fileName': subItem.fileName,
              'actionType': 'multiple',
              'name': subItem.productName,
              'fileName':subItem.fileName
            };
            subIndex == 1 ? obj['type'] = 'tds' : subIndex == 2 ? obj['type'] = 'msds' : obj['type'] = 'others-tds'
            // subIndex > 0 ? obj['fileName'] = subItem.fileName : ''
            subItem.flag ? obj['documentId'] = subItem.id : ''
            Data.push(obj);
          }
        })
      })
      if (Data.length > 0) {
        formDataVal.append("documentsData", JSON.stringify(Data));
      }
      else {
        Data.push({ 'projectId': this.id })
        formDataVal.append("documentsData", JSON.stringify(Data));
      }
      this.api.mulipartPost('documents/createDocument', formDataVal).subscribe(resp => {
        if (resp && resp.status == "200") {
          this.toastr.successToastr(resp.message);
          if (!this.id) {
            this.id = this.createdAtId;
          }
          this.onItemSelect({id:this.id},true)
          // this.router.navigateByUrl('/documents/' + this.projectDocumentsTitle + '?back=true')
          // this.listPath()
        }
      }, err => {
        err.error.message ? this.toastr.errorToastr(err.error.message) :
          this.toastr.errorToastr(err.error.errors[0].message);
      })
    } else {
      // !this.submitted ? this.toastr.errorToastr('Mandatory Fields are missing') : !flag ? this.toastr.errorToastr('soi documents is mandatory') :
      //  this.toastr.errorToastr('Please upload a documents')
      !flag && this.projectDocumentsTitle == 'tds' ? this.toastr.errorToastr('Product Name is mandatory') : !flag && this.projectDocumentsTitle == 'soi' ? this.toastr.errorToastr('soi documents is mandatory') :
        this.toastr.errorToastr('Please upload a documents')
    }
  }
}