import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, NavigationStart, ActivatedRoute, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
// export class AppComponent {
//   title = 'star-admin-angular';
// }
export class AppComponent implements OnInit {
  title = 'demo1';

  showSidebar: boolean = false;
  showNavbar: boolean = false;
  showFooter: boolean = false;
  isLoading: boolean;

  constructor(private router: Router, private activatedRoute: ActivatedRoute,) {
  }

  ngOnInit() {
    this.check();
  }

  ngDoCheck() {
    this.check();
  }
  check() {
    if ((this.router.url == '/') || (this.router.url == '/login') || (this.router.url == '/forgotpassword') || (this.router.url == '/error-pages/404') || (this.router.url == '/error-pages/500')) {
      this.showSidebar = false;
      this.showNavbar = false;
      this.showFooter = false;
    } else {
      this.showSidebar = true;
      this.showNavbar = true;
      this.showFooter = true;
    }
  }
}