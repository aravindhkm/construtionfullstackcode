import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkMonitoringComponent } from './work-monitoring.component';

describe('WorkMonitoringComponent', () => {
  let component: WorkMonitoringComponent;
  let fixture: ComponentFixture<WorkMonitoringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkMonitoringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
