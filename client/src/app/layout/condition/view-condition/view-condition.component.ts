import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ApiService } from '../../../services/api.service'
import { environment } from "src/environments/environment";
import { Location } from '@angular/common';
import { ModalDialogService } from 'src/app/services';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-view-condition',
  templateUrl: './view-condition.component.html',
  styleUrls: ['./view-condition.component.scss']
})
export class ViewConditionComponent implements OnInit {

  submitted = false
  imagePreviewUrl: any = [];
  imgUrl;
  workMonitoringDD: any = [];
  imageData = [];
  projectId = '';
  submission = false;
  monitorDatas = []
  modalRef: BsModalRef;
  exportChildData = [];
  projectName = '';
  monitorName = '';
  baseUrl = '';
  conditionBack
  onClick = false

  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private fb: FormBuilder, private toastr: ToastrManager, private api: ApiService,
    private location: Location, private modalDialogService: ModalDialogService,
    private modalService: BsModalService) {
    this.imgUrl = environment.image_url, this.baseUrl = environment.api_url
  }

  ngOnInit() {
    this.imageData = [
      {
        "imagePreview": '', "fileName": '', "imageId": ''
      }
    ]
    this.activatedRoute.params.subscribe((params: Params) => {
      this.projectId = params.id ? params.id : ''
      this.conditionBack = params.condition == 'condition' ? true : false
    })
    if (this.projectId) {
      this.editList({ id: this.projectId }, true)
    }
  }

  editList(options, isEdit) { //OnChange DropDown OR Edit List
    let id = '';
    if (isEdit) {
      id = options.id
    }
    if (!isEdit) {
      id = options.item_id
    }
    this.api.get('survey/list?projectId=' + id + '&type=condition').subscribe(resp => {
      if (resp && resp.status == "200" && resp.data && resp.data.rows && resp.data.rows[0] && resp.data.rows[0].ProjectSurveys.length > 0) {
        let respData = resp.data.rows[0];
        this.projectName = resp.data.rows[0].title
        let arry = [];
        respData.ProjectSurveys && respData.ProjectSurveys.map((item, index) => {
          let obj = {
            imagePreview: this.imgUrl + item.imagePath + item.imageName,
            fileName: item.imageName,
            imageId: item.id,
            isParentChecked: false,
            title: item.name
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
            "imagePreview": '', "fileName": '', "imageId": ''
          }
        ]
      }
    })
  }

  onImgClick(imageId, index) {
    this.onClick = true
    this.api.get('survey/list?projectId=' + this.projectId + '&type=condition&surveyId=' + imageId).subscribe(resp => {
      if (resp && resp.status == "200" && resp.data && resp.data.rows && resp.data.rows[0] && resp.data.rows[0].ProjectSurveys &&
        resp.data.rows[0].ProjectSurveys[0] && resp.data.rows[0].ProjectSurveys[0].SurveyProperties) {
        let dropResp = resp.data.rows[0].ProjectSurveys[0].SurveyProperties
        let subDropResp = resp.data.rows[0].ProjectSurveys[0].SurveyPropertyMaps
        this.monitorName = resp.data.rows[0].ProjectSurveys[0].name
        let monitorDatas = []
        dropResp.map((item, index) => {
          let dropArry = [];
          if (subDropResp.length > 0) {
            subDropResp.map((subItem, subIndex) => {
              let obj = {}
              if (item.id == subItem.propertyId) {
                obj['parentId'] = item.id,
                  obj['parentName'] = item.name,
                  obj['childName'] = subItem.name,
                  obj['imageName'] = subItem.imageName,
                  obj['imagePath'] = subItem.imagePath,
                  obj['isChildChecked'] = false
                dropArry.push(obj);
              }
            })
          } else {
            let obj = {}
            obj['parentId'] = item.id,
              obj['parentName'] = item.name,
              obj['isChildChecked'] = false
            dropArry.push(obj);
          }
          monitorDatas.push(dropArry);
        })
        if (monitorDatas.length < 1) {
          this.toastr.errorToastr("No Record Found")
        }
        this.monitorDatas = monitorDatas
      }
    })
  }
  openModal(event, template, data) {
    event.preventDefault();

    this.modalRef = this.modalService.show(template);
  }
  onParentCheckBoxChange(data, index) {
    this.imageData[index].isParentChecked = data.isParentChecked ? false : true
  }
  onChildCheckBoxChange(data, index) {
    this.monitorDatas[index].isChildChecked = data.isChildChecked ? false : true
  }
  exportParent() {
    let anyChecked = false;
    let surveyId = []
    this.imageData.forEach((item) => {
      item.isParentChecked ? surveyId.push(item.imageId) : ''
    })
    this.imageData.map((item, index) => {
      if (item.isParentChecked) {
        event.preventDefault();
        anyChecked = true
        var link = document.createElement('a');
        link.href = this.baseUrl + 'survey/exportPdf?surveyId=' + surveyId + '&projectId=' + this.projectId + '&surveyType=condition&type=three';
        link.target = '_blank';
        link.download = item.exportName + '.pdf';
        link.dispatchEvent(new MouseEvent('click'));
      }
    })
    if (!anyChecked) {
      this.toastr.errorToastr("Please Select any Checkbox to Export")
    }
  }
  exportChild() {
    let exportChildData = [];
    this.monitorDatas.map((item, index) => {
      if (item.isChildChecked) {
        exportChildData.push(item)
      }
    })
    this.exportChildData = exportChildData;
  }
  listPath() {
    this.router.navigateByUrl('/survey/condition?back=true')
  }
}