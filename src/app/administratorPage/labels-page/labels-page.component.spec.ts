/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LabelsPageComponent } from './labels-page.component';

describe('LabelsPageComponent', () => {
  let component: LabelsPageComponent;
  let fixture: ComponentFixture<LabelsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
