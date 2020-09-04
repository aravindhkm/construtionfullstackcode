import { Component, OnInit,ViewChild } from '@angular/core';
// import {SidebarComponent} from '../shared/sidebar/sidebar.component'

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  // @ViewChild(SidebarComponent, { static: false }) sideSlide: SidebarComponent;
  constructor() { }

  ngOnInit(): void {
  }

}
