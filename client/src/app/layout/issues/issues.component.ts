import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService, ModalDialogService } from 'src/app/services';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.scss']
})
export class IssuesComponent implements OnInit {
  page = 1
  itemsPerPage = 10
  collection
  issuesDatas = []
  search = ''
  submitted = false

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private toastr: ToastrManager,
    private apiService: ApiService, private modalDialogService: ModalDialogService) { }

  ngOnInit() {
    if (this.router.url.includes('back=true') && sessionStorage) {
      let sessionData = JSON.parse(sessionStorage.getItem('issueSessionData'))
      this.search = sessionData && sessionData.search ? sessionData.search : ''
      this.page = sessionData && sessionData.page ? sessionData.page : 1
      this.getIssueReport()
    }
    else {
      sessionStorage.removeItem('issueSessionData')
      this.search = ''
      this.itemsPerPage = 10
      this.page = 1
      this.getIssueReport()
    }

  }
  getIssueReport() {
    this.apiService.get('shared/getIssues?page=' + this.page + '&itemsPerPage=' + this.itemsPerPage + '&searchTxt=' + this.search).subscribe(resp => {
      if (resp) {
        this.issuesDatas = resp.data.rows
        this.collection = resp.data.count
      }
    })
  }
  onChange(event) {
    this.page = event
    this.getIssueReport()
  }

  submit(data) {
    this.search = data.search
      this.getIssueReport()
  }
  onReset() {
    sessionStorage.removeItem('issueSessionData')
    this.search = ''
    this.page = 1
    this.itemsPerPage = 10
    this.getIssueReport()
  }
  listPath() {

  }
  viewPath(id) {
    let obj = {
      "page": this.page,
      "search": this.search,
      "itemsPerPage": this.itemsPerPage
    }
    sessionStorage.setItem('issueSessionData', JSON.stringify(obj))
    this.router.navigateByUrl('issues/view/' + id)
  }
  delete(id) {
    this.modalDialogService.confirm("Confirm Delete", "Do you really want to delete ?", "Confirm", "Cancel").subscribe(result => {
      if (result) {
        this.apiService.delete('shared/deleteIssues?projectId=' + id).subscribe(resp => {
          if (resp.status == 200) {
            this.toastr.successToastr(resp.message)
            this.getIssueReport()
          }
        })
      }
    })
  }
}