import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPreConditionComponent } from './view-pre-condition.component';

describe('ViewPreConditionComponent', () => {
  let component: ViewPreConditionComponent;
  let fixture: ComponentFixture<ViewPreConditionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPreConditionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPreConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
