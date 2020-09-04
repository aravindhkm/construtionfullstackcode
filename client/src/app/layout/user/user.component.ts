import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router'
import { ModalDialogService } from '../../services/modal-dialog.service'
import { ApiService } from 'src/app/services';
import {UserService} from './user.service'
import { environment} from '../../../environments/environment'
import { ToastrManager } from 'ng6-toastr-notifications';
import { ExportToCsv } from 'export-to-csv';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit{
  staffRoute=false
  page = 1
  itemsPerPage=10
  collection
  listData=[]
  search=''
  statusItem=[{name:'Active',id:true},{name:'InActive',id:false}]
  statusArr=[]
  imagePath= environment.image_url + 'users/'
  exportData=[];
  staffType ='';

  constructor(private activatedroute:ActivatedRoute,public modalDialogService : ModalDialogService,
    private router:Router,private apiService:ApiService,public userService:UserService,private toastr:ToastrManager) { }
    
  ngOnInit() {
  this.activatedroute.params.subscribe((params:Params)=>{
        let staff=params.staff 
       
        this.staffRoute =  staff == 'contractor' ? false : true;
       
        this.staffType = staff == "contractor" ? "contractor" : staff == "staff" ? "staff" : "manager" ;

        console.log(this.staffType,"STAFFFFF");
       if(this.router.url.includes('back=true') == true ){
         let sessionData=JSON.parse(sessionStorage.getItem('staffSessionData'))
         this.search=sessionData && sessionData.search ? sessionData.search : ''
         this.page=sessionData && sessionData.page ? sessionData.page : 1;
        //  this.staffRoute ? this.getStaffList() : this.getContractorList();
        this.getList(this.staffType);

       }
       else{
         sessionStorage.removeItem('staffSessionData');
         this.search='';
         this.page=1;
        //  this.staffRoute ? this.getStaffList() : this.getContractorList();
        this.getList(this.staffType);
       }
      })
  }
  download(){
    let role = this.staffType;
    let params='users/list?role=' + role + '&type=export' + '&searchTxt=' + this.search
    this.apiService.get(params).subscribe(resp=>{
      if(resp && resp.data && resp.data.rows && this.listData.length > 0){
      this.exportData=resp.data.rows
    // this.userService.downloadFile(this.listData,role);
    const options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true, 
      showTitle: true,
      title: role,
      useTextFile: false,
      useBom: false,
      // useKeysAsHeaders: true,
      filename:role,
      headers: ['User Name','First Name','Company Name','Email','Image','Mobile Number','Status','Address']
    };
    let formatData=[]
    this.exportData && this.exportData.map((item)=>{
      let obj={
        firstName:item.firstName,userName:item.userName,companyName:item.companyName,email:item.email,
        imageName:item.imageName,mobile:item.mobile,status:item.status,address:item.address
      }
      formatData.push(obj)
    })
  const csvExporter = new ExportToCsv(options);  
  csvExporter.generateCsv(formatData);
      }
      else{
        this.toastr.errorToastr("No Data Found")
      }
    })
  }
  onChange(event){
    this.page = event
    // this.staffRoute ? this.getStaffList() : this.getContractorList()
    this.getList(this.staffType);
  }
  getList(type){
    let role=type;
    this.listData =[];
    let params='users/list?role=' + role + '&page=' + this.page + '&itemsPerPage=' + this.itemsPerPage + '&searchTxt=' + this.search
    this.apiService.get(params).subscribe(resp=>{
      if(resp && resp.data && resp.data.rows){
        this.listData=resp.data.rows
        this.collection=resp.data.count
        }
    })
  }
  getContractorList(){
    let role='contractor'
    let params='users/list?role=' + role + '&page=' + this.page + '&itemsPerPage=' + this.itemsPerPage + '&searchTxt=' + this.search
    this.apiService.get(params).subscribe(resp=>{
      if(resp && resp.data && resp.data.rows){
        this.listData=resp.data.rows
        this.collection=resp.data.count
        }
    })
  }
  getStaffList(){
    let role='staff'
    let params='users/list?role=' + role + '&page=' + this.page + '&itemsPerPage=' + this.itemsPerPage + '&searchTxt=' + this.search
    this.apiService.get(params).subscribe(resp=>{
      if(resp && resp.data && resp.data.rows){
      this.listData=resp.data.rows
      this.collection=resp.data.count
      }
    })
  }
  delete(id){
    // let role=this.staffRoute ? 'staff' : 'contractor'
    this.modalDialogService.confirm("Confirm Delete","Do you really want to delete ?","Confirm","Cancel").subscribe(result =>{
      if(result){
        this.apiService.delete('users/deleteUser?userId=' + id).subscribe(resp=>{
          if(resp.status == '200'){
            this.toastr.successToastr(resp.message)
            this.getList(this.staffType);
            // this.staffRoute ? this.getStaffList() : this.getContractorList()
          }
        })
      }
    })
  }
  addPath(role){
    let obj={
      "itemsPerPage":this.itemsPerPage,
      "page":this.page,
      "search":this.search
    }
    sessionStorage.setItem('staffSessionData',JSON.stringify(obj));
    role  == "contractor" ? this.router.navigateByUrl('user/contractor/add')  : role  == "staff" ? this.router.navigateByUrl('user/staff/add') : this.router.navigateByUrl('user/manager/add')  ;

  //  role == 'staff' ? this.router.navigateByUrl('user/staff/add') : this.router.navigateByUrl('user/contractor/add') 
  }
  viewPath(id){
    let obj={
      "itemsPerPage":this.itemsPerPage,
      "page":this.page,
      "search":this.search
    }
    sessionStorage.setItem('staffSessionData',JSON.stringify(obj))
    this.staffType  == "contractor" ? this.router.navigateByUrl('/user/contractor/edit/' + id)  : this.staffType  == "staff" ? this.router.navigateByUrl('/user/staff/edit/' + id)  : this.router.navigateByUrl('/user/manager/edit/' + id)   ;

    // this.staffRoute ? this.router.navigateByUrl('/user/staff/edit/' + id) : this.router.navigateByUrl('/user/contractor/edit/' + id)
  }
  submit(data){
    this.search=data.search
    this.getList(this.staffType);
    // this.staffRoute ? this.getStaffList() : this.getContractorList()
  }
  updateStatus(event,id){
    let obj={
      "userId":id,
      "status":event.toString()
    }
    this.modalDialogService.confirm("Confirm","Do you really want to update the status ?","Confirm","Cancel").subscribe(resp=>{
      if(resp){
        this.apiService.post('users/updateStatus',obj).subscribe(resp=>{
          if(resp && resp.data && resp.data[0] && resp.status == "200"){
            this.toastr.successToastr(resp.message)
            this.listData.forEach(value =>{
              if(value.id == resp.data[0].id){
                value.status = resp.data[0].status 
              }
            })
          }         
        })
      }else{
        // this.staffRoute ? this.getStaffList() : this.getContractorList()
        this.getList(this.staffType);
      }
    })
  }
  onReset(){
    this.search=''
    this.page=1
    // this.staffRoute ?  this.getStaffList() : this.getContractorList()
    this.getList(this.staffType);
  }
}