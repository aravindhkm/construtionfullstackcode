import { Component, OnInit ,ViewChild ,ElementRef ,OnChanges ,AfterViewInit} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService } from '../../../services/api.service'
import { environment } from "src/environments/environment";
import { TabsModule } from 'ngx-bootstrap/tabs';



@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss']
})
export class AddProjectComponent implements OnInit {
  submitted = false
  createProjectForm: FormGroup
  fileData: any = [];
  imagePreviewUrl: any = [];
  imgUrl;
  id;
  staffDD: any = [];
  managerDD: any = [];
  contractorDD: any = [];
  staffDDList: any = [];
  contractorDDList: any = [];
  managerDDList: any = [];
  ProjectName ='';
    @ViewChild('childData', { static: false }) childData: ElementRef;

  dropdownSettings: any = {};
  projectEditDatas: any = [];
   checkItCreated = false;

   SOIId;
   SOI = 'soi';
   TDSId;
   TDS = 'tds';
   CLAIMID;
   CLAIM = 'claims';
   PRODOCID;
   PRODOC= 'productDoc';
   WORKID;
   WORK = 'workMonitor';
   ISSUEID;
   ISSUE ='issue';
   INSPECID;
   INSPEC ='inspection';
  staffSettings = {}
  contractorSettings = {}
  managerSettings = {}
 


  constructor(private activatedRoute: ActivatedRoute, private router: Router,
    private fb: FormBuilder, private toastr: ToastrManager, private api: ApiService, private staticTabs: TabsModule) {
    this.imgUrl = environment.image_url
  }

  get f() {
    return this.createProjectForm.controls
  }
  onSelectChange(event)
  {

  }
  ngAfterViewInit(id)
  {
    let createdAtid =id;
    this.SOIId =createdAtid;
    this.TDSId = createdAtid;
    this.CLAIMID = createdAtid;
    this.PRODOCID = createdAtid;
    this.WORKID = createdAtid;
    this.ISSUEID = createdAtid;
    this.INSPECID = createdAtid;
    this.SOI = 'soi-add';
    this.TDS = 'tds-add';
    this.CLAIM = 'claims-add';
    this.PRODOC= 'productDoc-add';
    this.WORK = 'workMonitor-add';
    this.ISSUE ='issue-add';
    this.INSPEC ='inspection-add';
  }
  ngOnInit() {
    sessionStorage.removeItem('ProjectId');
    sessionStorage.removeItem('EditProjectId');
    this.dropDownSettings();
    this.createProjectForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      address: ['', Validators.required],
      location: ['', Validators.required],
      images: [],
      staffDD: [[], Validators.required],
      // managerDD:[[], Validators.required],
      contractorDD: [[], Validators.required]
    })
    this.SOI = 'soi-add';
    this.TDS = 'tds-add';
    this.CLAIM = 'claims-add';
    this.PRODOC= 'productDoc-add';
    this.WORK = 'workMonitor-add';
    this.ISSUE ='issue-add';
    this.INSPEC ='inspection-add';
    this.activatedRoute.params.subscribe((params: Params) => {
      this.id = params.id ? params.id : '';
     
    })
    if(this.id)
    {
       this.getEditList();
       this.checkItCreated= true;
    }
    this.getStaff_Contractor('staff');
    this.getStaff_Contractor('contractor');
    // this.getStaff_Contractor('manager');
  }
  Demo()
  {
       console.log('CONSTRUCTION');
  }

  ngOnChanges(id)
  {
    let createdAtid =id;
    this.SOIId =createdAtid;
    this.TDSId = createdAtid;
    this.CLAIMID = createdAtid;
    this.PRODOCID = createdAtid;
    this.WORKID = createdAtid;
    this.ISSUEID = createdAtid;
    this.INSPECID = createdAtid;
    this.SOI = 'soi-add';
    this.TDS = 'tds-add';
    this.CLAIM = 'claims-add';
    this.PRODOC= 'productDoc-add';
    this.WORK = 'workMonitor-add';
    this.ISSUE ='issue-add';
    this.INSPEC ='inspection-add';
  }
  dropDownSettings() {
    this.staffSettings = {
      singleSelection: false,
      text: "Select Staff",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      enableFilterSelectAll: true,
      showCheckbox: true,
      showSelectedItemsAtTop: false,
    };
    this.contractorSettings = {
      singleSelection: false,
      text: "Select Contractor",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      enableFilterSelectAll: true,
      showCheckbox: true,
      showSelectedItemsAtTop: false,
    };
    this.managerSettings = {
      singleSelection: false,
      text: "Select Manager",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      enableFilterSelectAll: true,
      showCheckbox: true,
      showSelectedItemsAtTop: false,
    };
  }

  restrictSpace(event) {
    if (!event.target.value) {
      event.target.value == "" && event.which == 32 ? event.preventDefault() : ''
    }
  }
  onDeSelectAll(event,type){
    if(type == 'staff'){
      this.createProjectForm.controls['staffDD'].setValue([])
    }
    else{
      this.createProjectForm.controls['contractorDD'].setValue([])
    }
  }
  getEditList() {
    sessionStorage.removeItem('ProjectId');
    sessionStorage.removeItem('EditProjectId');
    if(this.id)
    {
    this.SOIId =this.id;
    this.TDSId = this.id;
    this.CLAIMID = this.id;
    this.PRODOCID = this.id;
    this.WORKID = this.id;
    this.ISSUEID = this.id;
    this.INSPECID = this.id;
    this.SOI = 'soi-edit';
    this.TDS = 'tds-edit';
   this.CLAIM = 'claims-edit';
   this.PRODOC= 'productDoc-edit';
   this.WORK = 'workMonitor-edit';
   this.ISSUE ='issue-edit';
   this.INSPEC ='inspection-edit';
    }
    this.api.get('projects/list?' + "projectId=" + this.id).subscribe(resp => {
      if (resp && resp.status == "200" && resp.data && resp.data.rows && resp.data.rows[0]) {
        this.projectEditDatas = resp.data.rows;
        
        let staffRole = [];
        let contractorRole = [];
        // let managerRole = [];
       
        this.projectEditDatas[0].UserProjectMaps && this.projectEditDatas[0].UserProjectMaps.map(item => {
          let obj = {};
          if (item.User && item.User && item.User.role && item.User.userName) {
            obj = { 'id': item.userId, 'itemName': item.User.userName }
            item.User.role == "staff" ? staffRole.push(obj) : item.User.role == "contractor" ?contractorRole.push(obj):'';
          }
        })
        this.ProjectName = this.projectEditDatas[0].title;
        this.createProjectForm = this.fb.group({
          title: [this.projectEditDatas[0].title, Validators.required], description: [this.projectEditDatas[0].description, Validators.required],
          address: [this.projectEditDatas[0].address, Validators.required], location: [this.projectEditDatas[0].location, Validators.required],
          images: [this.projectEditDatas[0].imageName],
          contractorDD: [contractorRole, Validators.required],
          staffDD: [staffRole, Validators.required],
          // managerDD: [managerRole],

        })
        let obj ={
          id :this.id,
          name:this.projectEditDatas[0].title
        }
        sessionStorage.setItem('EditProjectId', JSON.stringify(obj));
        this.dropDownSettings();
        this.projectEditDatas[0].imageName.map((item) => {
          let value = this.imgUrl + '/projects/'
          this.imagePreviewUrl.push(value + item)
        })
      }
    }, err => {
      this.toastr.errorToastr(err.error.message);
    })
  }

  getStaff_Contractor(role) {
    this.api.get('users/listUsers?type=' + role).subscribe(resp => {
      if (resp && resp.status == "200" && resp.data && resp.data) {

        let DDList = [];
        resp.data.map(item => {
          let obj = { "id": item.id, "itemName": item.userName }
          DDList.push(obj);
        })
        if (role == "staff") {
          this.staffDDList = DDList;
        } 
        else if(role == "manager")
        {
          this.managerDDList = DDList;
        }
        else {
          this.contractorDDList = DDList;
        }
      }
    })
  }

  onItemSelect(item: any) {
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

  onSubmit() {
    this.submitted = true
    let formValues = this.createProjectForm.value
    if (formValues.title && formValues.description && formValues.location && formValues.address && (formValues.images && formValues.images.length > 0 || this.fileData.length > 0) && this.createProjectForm.valid) {
      let AssignArry = [];

      formValues.contractorDD && formValues.contractorDD.map(item => {
        AssignArry.push(item.id)
      })

      formValues.staffDD && formValues.staffDD.map(item => {
        AssignArry.push(item.id)
      })
      // formValues.managerDD && formValues.managerDD.map(item => {
      //   AssignArry.push(item.id)
      // })

      let params = {}
      let paramsData = new FormData();

      if (this.fileData.length > 0) {
        this.fileData.map((item) => {
          paramsData.append("images", item)
        })
        params = {
          projectId: this.id,
          title: formValues.title,
          description: formValues.description,
          location: formValues.location,
          address: formValues.address,
          userIds: AssignArry,
          // imageName:formValues.images
        }
        this.projectEditDatas[0] && this.projectEditDatas[0].imageName.length == 0 ? '' : params['imageName'] = formValues.images
      } else {
        params = {
          projectId: this.id,
          title: formValues.title,
          description: formValues.description,
          location: formValues.location,
          address: formValues.address,
          userIds: AssignArry,
          imageName: formValues.images
        }
      }
      paramsData.append("projectData", JSON.stringify(params));
    
      this.api.mulipartPost('projects/create', paramsData).subscribe(resp => {
        if (resp && resp.status == "200") {
          this.imagePreviewUrl=[]
          this.fileData=[]
          this.toastr.successToastr(resp.message);
          if(this.id)
          {
            this.getEditList();
          }
          if(!this.id && resp.data.id)
          {
            
            this.id =resp.data.id;
          //  this.id =resp.data.id;
          this.ProjectName = resp.data.title;
           let obj ={
             id :resp.data.id,
             name:resp.data.title
            }
           sessionStorage.setItem('ProjectId', JSON.stringify(obj));
           this.checkItCreated = true;
          }
          
       

          // this.router.navigateByUrl('/project?back=true')
        }
      }, err => {
        // err.error.message ? this.toastr.errorToastr(err.error.message) :
          this.toastr.errorToastr('API Failed');
      })
    } else {
      this.toastr.errorToastr('Mandatory Fields are missing');
    }
  }
  removeImage(data) {
    this.projectEditDatas[0] && this.projectEditDatas[0].imageName.splice(data, 1)
    this.imagePreviewUrl.splice(data, 1)
    // this.fileData.splice(data, 1)
    // console.log(this.fileData)
    // console.log(this.imagePreviewUrl)
  }
  listPath() {
    this.router.navigateByUrl('/project?back=true')
  }
}