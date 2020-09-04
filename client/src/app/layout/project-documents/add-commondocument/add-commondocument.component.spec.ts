import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCommondocumentComponent } from './add-commondocument.component';

describe('AddCommondocumentComponent', () => {
  let component: AddCommondocumentComponent;
  let fixture: ComponentFixture<AddCommondocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCommondocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCommondocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
