/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MobileViewService } from './mobileView.service';

describe('Service: MobileView', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MobileViewService]
    });
  });

  it('should ...', inject([MobileViewService], (service: MobileViewService) => {
    expect(service).toBeTruthy();
  }));
});