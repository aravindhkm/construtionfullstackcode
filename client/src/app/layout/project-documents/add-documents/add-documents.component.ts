import { Component, OnInit ,EventEmitter ,Input ,Output} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrManager, Toastr } from 'ng6-toastr-notifications';
import { ApiService } from '../../../services/api.service'
import { environment } from "src/environments/environment";
import * as fileSaver from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { ModalDialogService } from 'src/app/services';
import * as moment from 'moment';
import PerfectScrollbar from 'perfect-scrollbar';

@Component({
  selector: 'app-project-documents-add',
  templateUrl: './add-documents.component.html',
  styleUrls: ['./add-documents.component.scss']
})
export class AddDocumentsComponent implements OnInit {
  submitted = false
  createDocumentForm: FormGroup
  imgUrl;
  record;
  defaultRecord;
  names;
  id;
  projectLists: any = [];
  dropdownSettings: any = {}
  dropdownSettingsEdit: any = {}
  fileData: any = [];
  imagePreviewUrl: any = [];
  respData = []
  folderData = []
  scheduleRecord = []
  scheduleTitle
  respImage = []
  baseUrl;
  AddDocID;
  addprojectTitle;
  addprojectId;
  editprojectTitle;
  editprojectId;
  defaultDocumentList = [];
  @Input() PRODOCID: string;
  @Input() PRODOC: string;
  @Output() Projects: EventEmitter<any> = new EventEmitter();


  constructor(private activatedRoute: ActivatedRoute, private router: Router,
    private fb: FormBuilder, private toastr: ToastrManager, private api: ApiService,
    private http: HttpClient, private modalDialogService: ModalDialogService
  ) {
    this.imgUrl = environment.image_url
    this.baseUrl = environment.api_url
  }

  get f() {
    return this.createDocumentForm.controls
  }

  ngOnInit() {
    this.dropDownSettings();
    this.createDocumentForm = this.fb.group({
      projectData: [{value: '', disabled: true}], images: [], file: ['', Validators.required]
    })
    this.record = [];
    this.scheduleTitle = [{ 'name': 'Project Schedule' }]
    this.scheduleRecord = []
    this.defaultRecord = [];
    //  [
    //   [{ 'file': File = null,fileName: '',  actionId: '1'}, { 'file': File = null, fileName: '', actionId: '1' }]
    // ];
    this.names = [];
    // this.activatedRoute.params.subscribe((params: Params) => {
    //   this.id = params.id ? params.id : ''
    // })
    this.id = this.PRODOCID ? this.PRODOCID : "";
    let DocId :any= sessionStorage.getItem("ProjectId");
     if(DocId && this.PRODOC && this.PRODOC == 'productDoc-add')
     {
      let datas =JSON.parse(DocId);
      this.addprojectId = datas.id;
      this.createDocumentForm = this.fb.group({
        projectData: [{value: datas.name, disabled: true}],
        images: [], file: ['', Validators.required]
      })
     
     }
    this.getDocuments({}); //this.getEditList() called inside this function
    // this.getProject();
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
  onNameFieldChange(event,i,type){
    type == 'project' ? this.names[i].name=event.target.value : this.scheduleTitle[i].name=event.target.value
    if(type == 'project'){
      this.names[i].name=event.target.value
      this.record[i][0].flag=true
    }
    else{
      this.scheduleRecord[i][0].flag=true
      this.scheduleTitle[i].name=event.target.value
    }
  }
  onEachFileRemove(mainIndex,subIndex,labelIndex,documentId,type){
    if(type == 'project'){
      this.record[mainIndex][subIndex].fileName.splice(labelIndex,1)
      let url
      if(mainIndex == 4 || mainIndex == 5 || mainIndex == 7){
        url='documents/deleteDocument?mapId=' + documentId + '&projectId=' + this.id + '&documents=' + this.record[mainIndex][subIndex].fileName
      }
     else{
       url='documents/deleteDocument?documentId=' + documentId + '&projectId=' + this.id + '&documents=' + this.record[mainIndex][subIndex].fileName
     }
      documentId ? this.api.delete(url).subscribe(resp => { }) : ''
    }
    else{
      this.scheduleRecord[mainIndex][subIndex].fileName.splice(labelIndex,1)
      documentId ? this.api.delete('documents/deleteDocument?documentId=' + documentId + '&documents=' + this.scheduleRecord[mainIndex][subIndex].fileName).subscribe(resp => { }) : ''
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
  getEditList(id)
  {
    let ProjectTitle ;
    this.api.get('documents/list?projectId=' + id + '&type=document').subscribe(resp => {
      if (resp && resp.status == "200" && resp.data && resp.data.rows && resp.data.rows[0]) {
        if (resp.data && resp.data.folderData && resp.data.folderData.length > 0) {
          this.folderData = resp.data.folderData;
        }

        this.respData = resp.data.rows;
        let documentsData = resp.data.rows[0] && resp.data.rows[0].ProjectDocuments;
        //others push others data
        documentsData && documentsData.map((countItem)=>{
          if(countItem.actionId > 11){
         let parentObj = { 'file': File = null, fileName: '', actionId:countItem.actionId }
         this.record.push([parentObj])
         this.names.push({ name: 'Others' })
          }
        })

        ///edit image
        this.respData[0] && this.respData[0].ProjectDocuments && this.respData[0].ProjectDocuments[0] && this.respData[0].ProjectDocuments[0].imageName.map((item) => {
          let value = this.imgUrl + 'project-documents/images/'
          this.imagePreviewUrl.push(value + item)
        })
        let editImage = this.respData && this.respData[0] && this.respData[0].ProjectDocuments && this.respData[0].ProjectDocuments[0] && this.respData[0].ProjectDocuments[0].imageName
        let documentName = documentsData && documentsData[0] && documentsData[0].documentName;
        ProjectTitle = this.respData[0].title
        // projectData: [[{ "id": this.respData[0].id, "itemName": this.respData[0].title }], Validators.required],

        this.createDocumentForm = this.fb.group({

          projectData: [{value: this.respData[0].title , disabled: true}],
          images: [editImage], file: [documentName]
        })
        this.respImage = editImage ? editImage : []
        this.dropDownSettings();
        let nameObj = {}
        this.scheduleTitle = []
        let respObj = {}
        this.scheduleRecord = []
        resp.data.newData && resp.data.newData.map((newItem, newIndex) => {
            this.scheduleRecord.push([{ 'file': File = null, fileName: [], actionId: '1',filePath:[],documentId:'' }])
          if (resp.data.newData.length > 0) {
            nameObj = { 'name': newItem.name }
            this.scheduleTitle.push(nameObj)
          let date = moment(newItem.createdAt).format('D/M/YYYY, h:mm a');
          let dateTime = date && date.split(",");
            // respObj = {
            //   'documentId': newItem.id,
            //   'fileName': newItem.documentName,
            //   'baseUrl': this.baseUrl
            // }
            this.scheduleRecord[newIndex][0].uploadTime = dateTime[0] + " " + dateTime[1]
            this.scheduleRecord[newIndex][0].fileName = newItem.documentName
            this.scheduleRecord[newIndex][0].documentId = newItem.id
            this.scheduleRecord[newIndex][0].documentName = newItem.documentName
            this.scheduleRecord[newIndex][0].baseUrl = this.baseUrl
            // this.scheduleRecord.push([respObj])
          }
        })
        if (resp.data.newData.length == 0) {
          this.scheduleTitle = [{ 'name': 'Project Schedule' }]
          this.scheduleRecord = [[{ 'file': File = null, fileName: [], actionId: '1',filePath:[] }]]
        }
        documentsData && documentsData.map((item, index) => {
          if (this.record && this.record[item.actionId - 1] && this.record[item.actionId - 1][0] && item.actionId) {
            if (item.ProjectDocumentMaps.length > 0) {
              item.ProjectDocumentMaps && item.ProjectDocumentMaps.map((subItem, subIndex) => {
                if (this.record[item.actionId - 1] && this.record[item.actionId - 1][subIndex] && (this.record[item.actionId - 1][subIndex] && this.record[item.actionId - 1][subIndex])) {
                let date = moment(item.createdAt).format('D/M/YYYY, h:mm a');
                let dateTime = date && date.split(",");
                 this.record[item.actionId - 1][subIndex].uploadTime = dateTime[0] + " " + dateTime[1]
                  this.record[item.actionId - 1][subIndex].fileName = subItem.documentName
                  this.record[item.actionId - 1][subIndex].actionId = item.actionId
                  this.record[item.actionId - 1][subIndex].documentId = subItem.id
                  this.record[item.actionId - 1][subIndex].documentName = subItem.fileName
                  this.record[item.actionId - 1][subIndex].path = subItem.path
                  this.record[item.actionId - 1][subIndex].baseUrl = this.baseUrl
                  for(let i=0;i < subItem.documentName.length;i++){
                  this.names[item.actionId].name=item.name
                  }
                }
              })
            } 
            // else if (item.actionId <= 11) {
              else if (this.record[item.actionId -1].length == 1){
              let date = moment(item.createdAt).format('D/M/YYYY, h:mm a');
              let dateTime = date && date.split(",");
              this.record[item.actionId -1][0].uploadTime=dateTime[0] + " " + dateTime[1]
              this.record[item.actionId -1][0].fileName = item.documentName
              this.record[item.actionId -1][0].actionId = item.actionId
              this.record[item.actionId -1][0].documentId = item.id
              this.record[item.actionId -1][0].documentName = item.fileName
              this.record[item.actionId -1][0].path = item.path
              this.record[item.actionId -1][0].baseUrl = this.baseUrl
              for(let i=0;i < item.documentName.length;i++){
              }
              this.names[item.actionId -1].name=item.name
            }
          }
          else {
            // this.record && this.record.map((recordItem, recordIndex) => {
            //   if (recordItem[0].actionId == item.actionId) {
            //     this.record[recordIndex][0].fileName = item.documentName
            //     this.record[recordIndex][0].actionId = item.actionId
            //     this.record[recordIndex][0].documentId = item.id
            //     this.record[recordIndex][0].documentName = item.fileName
            //     this.record[recordIndex][0].path = item.path
            //     this.record[recordIndex][0].baseUrl = this.baseUrl
            //   }
            // })
            let date = moment(item.createdAt).format('D/M/YYYY, h:mm a');
            let dateTime = date && date.split(",");
            let arr=[]
              let obj={
                fileName:item.documentName,
                documentId:item.id,
                documentName:item.fileName,
                path:item.path,
                baseUrl:this.baseUrl,
                uploadTime:dateTime[0] + " " + dateTime[1]
              }
              arr.push(obj)
              this.record.push(arr)
              this.names.push({name:item.name})
          }
        })
      }
      else {        
        let DocId :any= sessionStorage.getItem("ProjectId");
        let DId :any= sessionStorage.getItem("EditProjectId");
        if(DocId && this.PRODOC && this.PRODOC == 'productDoc-add')
        {
         let datas =JSON.parse(DocId);  
         this.createDocumentForm = this.fb.group({
           projectData: [  {value: datas.name, disabled: true}],
           images: [], file: ['', Validators.required]
         })
        
        }
        else {

          if(DId)
          {
            let datas =JSON.parse(DId); 
            this.createDocumentForm = this.fb.group({
              projectData: [ {value: datas.name, disabled: true}],
              images: [], file: ['', Validators.required]
            })
          }
          
        }
        // this.getDocuments({})
        this.createDocumentForm.controls['file'].setValue('')
      }
    })
  }
  getDocuments(options) { //Get Basics Fields and (Edit List OR Dates Filter datas)
    this.api.get('masters/list?type=document').subscribe(resp => {
      if (resp && resp.status == "200" && resp.data) {
        this.defaultDocumentList = resp.data
        let defaultList = [];
        let namesArray = [];
        resp.data.map((item, index) => {
          let arrayData = [];
          let parentObj = {};
          let nameObj = {};
          //push multiple Sub fields
          parentObj = { 'file': File = null, fileName: [], actionId: item.id,filePath:[],filePathLabel:'' }
          if (index == 4) {
            arrayData = [{ 'file': File = null, fileName: [], actionId: item.id,placeHolder:'Gondolas' ,filePath:[],filePathLabel:''},
            { 'file': File = null, fileName: [], actionId: item.id,placeHolder:'Rope Access Systems',filePath:[],filePathLabel:'' }]
          }
          else if(index == 5){
            arrayData = [{ 'file': File = null, fileName: [], actionId: item.id ,placeHolder:'Copy of Work Permit',filePath:[],filePathLabel:''},
            { 'file': File = null, fileName: [], actionId: item.id,placeHolder:'Certificates (CSOC,First Aid,Safety Supervisior)',filePath:[],filePathLabel:'' }]
          } 
          else if (index == 7) {
            arrayData = [{ 'file': File = null, fileName: [], actionId: item.id,placeHolder:'Shifting Plan' ,filePath:[],filePathLabel:''},
            { 'file': File = null, fileName: [], actionId: item.id,placeHolder:'Rope Access Systems',filePath:[],filePathLabel:'' },
            { 'file': File = null, fileName: [], actionId: item.id,placeHolder:'Proposed Site Storage & Office',filePath:[],filePathLabel:'' }]
          } else {
            //push Fields Datas
            index <= 10 ? arrayData.push(parentObj) : ''
          }
          index <= 10 ? defaultList.push(arrayData) : ''
          //pushing names
          // index > 10 ? nameObj = { name: 'Others' } : 
          nameObj = { name: item.name }
          index <= 10 ? namesArray.push(nameObj) : ''
          // this.names[index].name = item.name
        })
        this.record = defaultList;
        this.scheduleRecord = [[{ 'file': File = null, fileName: [], actionId: '1',filePath:[],filePathLabel:'' }]]
        this.defaultRecord = defaultList;
        this.names = namesArray;
     
        // if (this.id && !options.dateId) {
        //   // this.getEditList(this.id);
        //   this.getEditList(this.id);
        //   // this.onItemSelect({ "id": this.id }, true)  //Edit List
        // }
        // if (options.dateId) {
        //   this.onItemSelect({ "dateId": options.dateId }, true); 
        // }

     if(this.id)
     {   
        this.getEditList(this.id)
     }
      }
    })
  }
  AddAnotherField(type) { //Add another Field
    if (type == 'schedule') {
      let count = this.scheduleRecord.length;
      let NameField = { 'name': 'Project Schedule ' };
      let Field = [{ 'file': File, fileName:[], actionId: count + 1, actionName: 'Others' + count + 1, newData: true ,filePath:[],filePathLabel:''}];
      this.scheduleTitle.push(NameField);
      this.scheduleRecord.push(Field);
    }
    else {
      let count = this.defaultDocumentList.length;
      let actionId = this.defaultDocumentList[count - 1].id
      // let NameField = { 'name': count + 1 + 'Data' };
      let NameField = { 'name': 'Others' };
      let Field = [{ 'file': File, fileName: [], actionId: (actionId + 1), newData: true ,filePath:[],filePathLabel:''}];
      this.defaultDocumentList.push({id:(actionId+1),'file': File, fileName: ''})
      this.names.push(NameField);
      this.record.push(Field);
    }
  }
  removeFiles(mainId, subId, type) { //Reset Documents
    if (type == 'schedule') {
      let documentId = this.scheduleRecord[mainId][subId].documentId
      documentId ? this.api.delete('documents/deleteDocument?documentId=' + documentId + '&projectId=' + this.id + '&type=new').subscribe(resp => { }) : ''
      this.scheduleRecord[mainId][subId].file = File
      this.scheduleRecord[mainId][subId].fileName = ''
    }
    else {
      let documentId = this.record[mainId][subId].documentId
      let url
      if(mainId == 4 || mainId == 5 || mainId == 7){
         url='documents/deleteDocument?mapId=' + documentId + '&projectId=' + this.id + '&type=document'
      }
      else{
         url='documents/deleteDocument?documentId=' + documentId + '&projectId=' + this.id + '&type=document'
      }
      documentId ? this.api.delete(url).subscribe(resp => { }) : ''
      this.record[mainId][subId].file = File;
      this.record[mainId][subId].filePath = [];
      this.record[mainId][subId].fileName = [];
      this.record[mainId][subId].filePathLabel = '';
      this.record[mainId][subId].actionId = mainId + 1;
    }
  }
  removeField(index, Data, type) { // Remove Particular Field
    this.modalDialogService.confirm("Confirm Remove", "Are you sure you want to remove ?", "Confirm", "Cancel").subscribe(result => {
      if (result) {
        let documentId = '';
        let actionId = '';
        if (Data[0] && Data[0].documentId) {
          documentId = Data[0].documentId;
          actionId = Data[0].actionId;
        }
        if (type == 'schedule') {
          if (documentId) {
            this.api.delete('documents/deleteDocument?documentId=' + documentId + '&type=new').subscribe(resp => {
              if (resp && resp.status == 200) {
                this.scheduleRecord.splice(index, 1);
                this.scheduleTitle.splice(index, 1);
                this.toastr.successToastr("Fields Removed Sucessfully")
              }
            })
          }
          else {
            this.scheduleRecord.splice(index, 1);
            this.scheduleTitle.splice(index, 1);
            this.toastr.successToastr("Fields Removed Sucessfully")
          }
        }
        else {
          if (documentId) {
            this.api.delete('documents/deleteDocument?documentId=' + documentId  + '&type=document').subscribe(resp => {
              if (resp && resp.status == 200) {
                this.record.splice(index, 1);
                this.names.splice(index, 1);
                this.toastr.successToastr("Fields Removed Sucessfully")
              }
            })
          }
          else {
            this.record.splice(index, 1);
            this.names.splice(index, 1);
            this.toastr.successToastr("Fields Removed Sucessfully")
          }
        }
      }
    })
  }

uploadDocument(mainId, subId, fileInput: any, data, type,fieldName) {
  var filesAmount = fileInput.target.files.length;
  let fileName =[];
  let files =[];
  
  if (type == 'schedule') {
//     this.scheduleRecord[mainId][subId].file = <File>fileInput.target.files[0];
// this.scheduleRecord[mainId][subId].fileName = <File>fileInput.target.files[0].name;

  for (let i = 0; i < filesAmount; i++) {
        this.scheduleRecord[mainId][subId].filePath.push(<File>fileInput.target.files[i])
        this.scheduleRecord[mainId][subId].file=<File>fileInput.target.files[i] 
        this.scheduleRecord[mainId][subId].fileName.push(<File>fileInput.target.files[i].name)
  }
        this.scheduleRecord[mainId][subId].flag=true
        let currentDate = new Date();
        let date = moment(currentDate).format('D/M/YYYY, h:mm a');
        let dateTime = date && date.split(",");
        this.scheduleRecord[mainId][subId].uploadTime = dateTime[0] + " " + dateTime[1]
  }
  else {
  for (let i = 0; i < filesAmount; i++) {
  this.record[mainId][subId].filePath.push(<File>fileInput.target.files[i])
  this.record[mainId][subId].file=<File>fileInput.target.files[i]
   this.record[mainId][subId].fileName.push(<File>fileInput.target.files[i].name)
  }
  let currentDate = new Date();
  let date = moment(currentDate).format('D/M/YYYY, h:mm a');
  let dateTime = date && date.split(",");
  this.record[mainId][subId].uploadTime = dateTime[0] + " " + dateTime[1]
  
  // this.createDocumentForm.controls['file'].setValue(file ? file.name : '');
  
// let file = fileInput.target.files[0]
// this.createDocumentForm.controls['file'].setValue(file ? file.name : '')
// this.record[mainId][subId].file = <File>fileInput.target.files[0];
// this.record[mainId][subId].fileName = <File>fileInput.target.files[0].name;
this.record[mainId][subId].actionId = data.actionId ? data.actionId : this.names[mainId];
this.record[mainId][subId].name = fieldName;
this.record[mainId][subId].flag=true
  }
  fileInput.target.value=''
  }
  fileProgresssss(fileInput: any) {
    var filesAmount = fileInput.target.files.length;
   
    if (fileInput.target.files) {
      for (let i = 0; i < filesAmount; i++) {
        this.fileData.push(<File>fileInput.target.files[i])
      }
    }
    this.preview(fileInput);
  }
  listPath() {
    this.router.navigateByUrl('/document?back=true')
  }

  onSubmit() {
    this.submitted = true

    let formValues = this.createDocumentForm.value;
    let flag=true
    for(let i=0;i < this.names.length;i++){
      if(this.names[i].name == ''){
        flag=false
        break;
      }
    }
    for(let i=0;i < this.scheduleTitle.length;i++){
      if(this.scheduleTitle[i].name == ''){
        flag=false
        break;
      }
    }
    if (flag && this.id || this.addprojectId ) {
      let projectId;
      if(this.id)
      {
        projectId = this.id
      }
      if(!this.id)
      {
        projectId =  this.addprojectId 
      }
      // let projectId = formValues.projectData[0] && formValues.projectData[0].id

      let formDataVal = new FormData();
      let Data = [];
      let obj = {}
      let scheduleData = []
      let scheduleObj = {}
      let imageName = {}
      if (this.fileData.length > 0) {
        this.fileData && this.fileData.map((item) => {
          formDataVal.append('docImages', item)
        })
        if (this.respData && this.respData[0] && this.respData[0].ProjectDocuments && this.respData[0].ProjectDocuments[0] &&
          this.respData[0].ProjectDocuments[0].imageName && this.respData[0].ProjectDocuments[0].imageName.length == 0) {
          imageName['projectId'] = projectId
          imageName['imageValue'] = this.respImage
          formDataVal.append('imageName', JSON.stringify(imageName))
        }
        else {
          imageName['projectId'] = projectId
          imageName['imageValue'] = this.respImage
          formDataVal.append('imageName', JSON.stringify(imageName))
        }
      }
      else {
        imageName['projectId'] = projectId
        imageName['imageValue'] = this.respImage
        formDataVal.append('imageName', JSON.stringify(imageName))
      }
      this.record && this.record.map((item, index) => {
        item.map((subItem, subIndex) => {
          if (subItem.file && subItem.fileName.length != 0) {
            for(let i=0;i<subItem.filePath.length;i++){
            formDataVal.append("documents", subItem.filePath[i]);
            }
          }
          if(subItem.flag){
            obj = {
              "projectId": projectId,
              "type": "document",
              //  'actionId': subItem.actionId,
              'fileName': subItem.fileName,
              'fieldName':this.names[index].name
            };
            subItem.actionId <= 11 ? obj['actionId']= subItem.actionId : ''
            if (subItem.documentName) {
              obj['documentId'] = subItem.documentId
            }
            if (subItem.actionName) {
              obj['actionName'] = subItem.actionName;
            }
            if (item.length > 1) {
              obj['actionType'] = 'multiple';
            } else {
              obj['actionType'] = 'single';
            }
            Data.push(obj);
          }
          // }
        })
      })
      this.scheduleRecord && this.scheduleRecord.map((item, index) => {
        item.map((subItem, subIndex) => {
          if (subItem.flag) {
            if(subItem.file){
              for(let i=0;i < subItem.filePath.length;i++){
                formDataVal.append("newDocuments", subItem.filePath[i])
              }
            }
            // subItem.file ? formDataVal.append("newDocuments", subItem.file) : ''
            scheduleObj = {
              "projectId": projectId,
              "type": "new",
              'fileName': subItem.fileName,
              'actionType': "single",
              'fieldName':this.scheduleTitle[index].name
            };
            subItem.documentId ? scheduleObj['documentId'] = subItem.documentId : ''
            Data.push(scheduleObj);
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
      this.api.mulipartPost('documents/create', formDataVal).subscribe(resp => {
        if (resp && resp.status == "200") {
          this.toastr.successToastr(resp.message);
          this.imagePreviewUrl=[]
          this.fileData=[]
          this.getDocuments({})
          if(!this.id)
          {
             this.id =  this.addprojectId;
          }
          // this.router.navigateByUrl('/document?back=true')
        }
      })
    } else {
      this.submitted && !flag ? this.toastr.errorToastr('Fields are missing or invalid') : ''
      // !this.submitted && !flag ? this.toastr.errorToastr('Title must be required ') : this.toastr.errorToastr('Please upload a documents')
      // this.submitted && !flag ? this.toastr.errorToastr('Title must be required ')  :''
    }
  }
  fileProgress(fileInput: any) {
    var filesAmount = fileInput.target.files.length;
    if (fileInput.target.files) {
      for (let i = 0; i < filesAmount; i++) {
        this.fileData.push(<File>fileInput.target.files[i])
      }
    }
    this.preview(fileInput);
    fileInput.target.value=''
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
  removeImage(data) {
    this.imagePreviewUrl.splice(data, 1)
    this.respImage.splice(data, 1)
  }
}