import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropMonitoringComponent } from './drop-monitoring.component';

describe('DropMonitoringComponent', () => {
  let component: DropMonitoringComponent;
  let fixture: ComponentFixture<DropMonitoringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropMonitoringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
