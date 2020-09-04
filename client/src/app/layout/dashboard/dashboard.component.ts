import { Component, OnInit } from '@angular/core';
import { ChartType, ChartDataSets, ChartOptions, } from 'chart.js';
import { MultiDataSet, Label, Color } from 'ng2-charts';
import { ApiService } from 'src/app/services';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToastrManager, Toastr } from 'ng6-toastr-notifications';
import { environment } from "src/environments/environment";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  createDocumentForm: FormGroup
  dropdownSettings: any = {}
  projectLists: any = [];
  imgUrl;
  baseUrl;
  //1 chart
  userChartLabels: Label[] = [];
  userChartData: MultiDataSet = [];
  userChartType: ChartType = 'doughnut';
  ChartColors: Color[] = [{ backgroundColor: ["#9E120E", "#FF5800", "#FFB414"] }]
  isReset = true;
  //First Barchart
  barChartOptions: ChartOptions = {
    responsive: true,
  };
  barChartLabels: Label[] = [];
  barChartType: ChartType = 'bar';
  barChartLegend = true;
  barChartPlugins = [];
  barChartData: ChartDataSets[] = [
    { data: [], label: 'Inspection' }
  ];
  //Second Bar chart
  barChartOptions1: ChartOptions = {
    responsive: true,
  };
  barChartLabels1: Label[] = [];
  barChartType1: ChartType = 'bar';
  barChartLegend1 = true;
  barChartPlugins1 = [];
  barChartData1: ChartDataSets[] = [
    { data: [], label: 'Issue' }
  ];
  constructor(private activatedRoute: ActivatedRoute, private router: Router,
    private fb: FormBuilder, private toastr: ToastrManager, private api: ApiService,
    private http: HttpClient
  ) {
    this.imgUrl = environment.image_url
    this.baseUrl = environment.api_url
  }
  get f() {
    return this.createDocumentForm.controls
  }
  ngOnInit(): void {
    this.dropDownSettings();
    this.createDocumentForm = this.fb.group({
      projectData: [[], Validators.required]
    })
    this.getProject();
  }
  dropDownSettings() {
    this.dropdownSettings = {
      singleSelection: false,
      text: "Select Project",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      enableFilterSelectAll: true,
      showCheckbox: true,
      showSelectedItemsAtTop: false,
    };
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
  onItemDeSelect() {
    this.createDocumentForm.controls['projectData'].setValue([])
  }
  onItemSelect(options, isReset) { //OnChange DropDown OR Edit List
    let ids = [];
    if (isReset) {
      this.isReset = true;
      this.createDocumentForm.controls['projectData'].setValue([])
      return
    }
    this.createDocumentForm.controls.projectData && this.createDocumentForm.controls.projectData.value
      && this.createDocumentForm.controls.projectData.value.map(item => {
        ids.push(item.id);
      })
    if (ids.length > 0) {
      this.isReset = false
      this.api.get('shared/reports?projectId=' + ids).subscribe(resp => {
        if (resp && resp.data) {
          let userData = resp.data.userData;
          let inspectionData = resp.data.inspectionData;
          let issueData = resp.data.issueData;
          let userLoadData = [];
          if (userData) {
            userLoadData.push(userData.contractorCount)
            userLoadData.push(userData.staffCount)
            userLoadData.push(userData.totalUsers)
            this.userChartLabels = ['contractorCount', 'staffCount', 'totalUsers']
            this.userChartData = [userLoadData]
          }
          if (inspectionData) {
            this.barChartLabels = ['defects', 'rectification', 'totalInspection'];
            this.barChartData[0].data = [inspectionData.defects, inspectionData.rectification, inspectionData.totalInspection]
          }
          if (issueData) {
            this.barChartLabels1 = ['defects', 'rectification', 'totalIssues'];
            this.barChartData1[0].data = [issueData.defects, issueData.rectification, issueData.totalIssues]
          }
        }
      })
    } else {
      this.toastr.errorToastr("Please Select DropDown")
    }
  }
}
