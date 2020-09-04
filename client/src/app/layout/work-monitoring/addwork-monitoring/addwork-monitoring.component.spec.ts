import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddworkMonitoringComponent } from './addwork-monitoring.component';

describe('AddworkMonitoringComponent', () => {
  let component: AddworkMonitoringComponent;
  let fixture: ComponentFixture<AddworkMonitoringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddworkMonitoringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddworkMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
