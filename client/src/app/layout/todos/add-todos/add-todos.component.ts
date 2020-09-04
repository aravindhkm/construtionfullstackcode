import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService } from '../../../services/api.service'
import { environment } from "src/environments/environment";
// import { IDayCalendarConfig, DatePickerComponent } from "ng2-date-picker";

@Component({
  selector: 'app-add-todos',
  templateUrl: './add-todos.component.html',
  styleUrls: ['./add-todos.component.scss']
})
export class AddTodosComponent implements OnInit {
  submitted = false
  createProjectForm: FormGroup
  fileData: any = [];
  imagePreviewUrl: any = [];
  imgUrl;
  id;
  projectDD: any = [];
  userDD: any = [];
  projectDDList: any = [];
  userDDList: any = [];
  dropdownSettings: any = {}
  projectEditDatas: any = []

  // dropdownList=[]
  projectSettings = {}
  userSettings = {}

  constructor(private activatedRoute: ActivatedRoute, private router: Router,
    private fb: FormBuilder, private toastr: ToastrManager, private api: ApiService) {
    this.imgUrl = environment.image_url
  }

  get f() {
    return this.createProjectForm.controls
  }

  ngOnInit() {
    this.dropDownSettings();
    this.createProjectForm = this.fb.group({
      date: ['', Validators.required],  
      title: ['', Validators.required],
      time: ['', Validators.required],
      projectDD: [[], Validators.required],
      userDD: [[], Validators.required],
      description: ['', Validators.required]     
    })

    this.activatedRoute.params.subscribe((params: Params) => {
      this.id = params.id ? params.id : ''
    })
    if (this.id) {
      this.getEditList()
    }
    // this.getStaff_Contractor();
    // this.getTodoList();
    this.getProject();


  }
  dropDownSettings() {
    this.projectSettings = {
      singleSelection: true,
      text: "Select Project",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class tick-box",
      enableFilterSelectAll: false,
      showCheckbox: true,
      showSelectedItemsAtTop: true,
      onDropDownClose : true
    };
    this.userSettings = {
      singleSelection: false,
      text: "Select People",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      enableFilterSelectAll: true,
      maxHeight:150,
      // badgeShowLimit:3,
      showCheckbox: true,
      showSelectedItemsAtTop: false,
      position:"top"
    };
  }

  restrictSpace(event) {
    if (!event.target.value) {
      event.target.value == "" && event.which == 32 ? event.preventDefault() : ''
    }
  }
  getEditList() {
    this.api.get('todos/list?' + "todoId=" + this.id).subscribe(resp => {
      if (resp && resp.status == "200" && resp.data && resp.data.rows && resp.data.rows[0]) {
        let todoEditList =  resp.data.rows[0];

        let userArry = [];
        resp.data.userData && resp.data.userData.map(item => {
          
          if((resp.data.rows[0].userId).includes(item.id)){
            let userobj = {"id" : item.id,"itemName" : item.userName};
            userArry.push(userobj);
          }
        })


        this.createProjectForm = this.fb.group({
          title: [todoEditList.title, Validators.required], description: [todoEditList.description, Validators.required],
          time: [todoEditList.time, Validators.required], date: [todoEditList.date, Validators.required],
          userDD: [userArry],
          projectDD: [[{"id" : todoEditList.Project && todoEditList.Project.id,"itemName" :todoEditList.Project && todoEditList.Project.title }]]
        })
        this.dropDownSettings();  
        this.getTodoList(this.id)     
      }
    }, err => {
      this.toastr.errorToastr(err.error.message);
    })
  }

  getProject() { //Get DropDown List
    this.api.get('projects/listProjects').subscribe(resp => {
      if (resp && resp.status == "200" && resp.data) {
        let DDList = [];
        resp.data.map(item => {
          let obj = { "id": item.id, "itemName": item.title }
          DDList.push(obj);
        })
        this.projectDDList = DDList;
      }
    })
  }

  getTodoList(id){
    this.api.get('users/listUsers?projectId='+id).subscribe(resp=>{
      if(resp && resp.data && resp.data){
        let subDDList = [];
        let listData =[];
        listData = resp.data;
        listData.map(item => {
                    let obj = { "id": item.id, "itemName": item.userName }
                    subDDList.push(obj);
                  })
                  this.userDDList = subDDList;
       
                }
    })
  }

  onItemSelect(item: any) {
    this.getTodoList(item.id);
  }

  listPath() {
    this.router.navigateByUrl('/todo?back=true')
  }

  onSubmit() {
    this.submitted = true
    let formValues = this.createProjectForm.value
    if (formValues.title && formValues.description && formValues.title && formValues.date && formValues.time && formValues.userDD && formValues.projectDD && this.createProjectForm.valid) {
      let AssignArry = [];

      formValues.userDD && formValues.userDD.map(item => {
        AssignArry.push(item.id)
      })


      let projectId;
      formValues.projectDD && formValues.projectDD.map(item => {
        // AssignArry.push(item.id)
        projectId = item.id
      })
     

      // projectId,userId-array of values

        let params = {
          todoId: this.id,
          projectId: projectId,
          title: formValues.title,
          description: formValues.description,
          date: formValues.date,
          time: formValues.time,
          userId: AssignArry,
          createdBy : localStorage.getItem("userId")

          // imageName: formValues.images
        }
      // }
    // }

      this.api.post('todos/create', params).subscribe(resp => {
        if (resp && resp.status == "200") {
          this.toastr.successToastr(resp.message);
          this.router.navigateByUrl('/todo?back=true')
        }
      }, err => {
        err.error.message ? this.toastr.errorToastr(err.error.message) :
          this.toastr.errorToastr(err.error.errors[0].message);
      })
    } else {
      this.toastr.errorToastr('Mandatory Fields are missing');
    }

  }
}