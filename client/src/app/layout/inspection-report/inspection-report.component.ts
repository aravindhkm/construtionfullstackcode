import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService, ModalDialogService } from 'src/app/services';

@Component({
  selector: 'app-inspection-report',
  templateUrl: './inspection-report.component.html',
  styleUrls: ['./inspection-report.component.scss']
})
export class InspectionReportComponent implements OnInit {
  page = 1
  itemsPerPage = 10
  collection
  inspectionDatas = []
  search = ''
  submitted = false

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private toastr: ToastrManager,
    private apiService: ApiService, private modalDialogService: ModalDialogService) { }

  ngOnInit() {
    if (this.router.url.includes('back=true') && sessionStorage) {
      let sessionData = JSON.parse(sessionStorage.getItem('inspectionSessionData'))
      this.search = sessionData && sessionData.search ? sessionData.search : ''
      this.page = sessionData && sessionData.page ? sessionData.page : 1
      this.getInspectionReport()
    }
    else {
      sessionStorage.removeItem('inspectionSessionData')
      this.search = ''
      this.itemsPerPage = 10
      this.page = 1
      this.getInspectionReport()
    }

  }
  getInspectionReport() {
    this.apiService.get('shared/list?page=' + this.page + '&itemsPerPage=' + this.itemsPerPage + '&searchTxt=' + this.search).subscribe(resp => {
      if (resp) {
        this.inspectionDatas = resp.data.rows
        this.collection = resp.data.count
      }
    })
  }

  onChange(event) {
    this.page = event
    this.getInspectionReport()
  }

  submit(data) {
    this.search = data.search
      this.getInspectionReport()
  }
  onReset() {
    sessionStorage.removeItem('inspectionSessionData')
    this.search = ''
    this.page = 1
    this.itemsPerPage = 10
    this.getInspectionReport()
  }
  viewPath(id) {
    let obj = {
      "page": this.page,
      "search": this.search,
      "itemsPerPage": this.itemsPerPage
    }
    sessionStorage.setItem('inspectionSessionData', JSON.stringify(obj))
    this.router.navigateByUrl('inspection-report/view/' + id)
  }
  delete(id) {
    this.modalDialogService.confirm("Confirm Delete", "Do you really want to delete ?", "Confirm", "Cancel").subscribe(result => {
      if (result) {
        this.apiService.delete('shared/deleteInspections?projectId=' + id).subscribe(resp => {
          if (resp.status == 200) {
            this.toastr.successToastr(resp.message)
            this.getInspectionReport()
          }
        })
      }
    })
  }
}