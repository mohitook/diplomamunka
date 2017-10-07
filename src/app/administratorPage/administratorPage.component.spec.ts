/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdministratorPageComponent } from './administratorPage.component';

describe('AdministratorPageComponent', () => {
  let component: AdministratorPageComponent;
  let fixture: ComponentFixture<AdministratorPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministratorPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministratorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
