import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageMonitoringComponent } from './image-monitoring.component';

describe('ImageMonitoringComponent', () => {
  let component: ImageMonitoringComponent;
  let fixture: ComponentFixture<ImageMonitoringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageMonitoringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
