import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewConditionComponent } from './view-condition.component';

describe('ViewConditionComponent', () => {
  let component: ViewConditionComponent;
  let fixture: ComponentFixture<ViewConditionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewConditionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
