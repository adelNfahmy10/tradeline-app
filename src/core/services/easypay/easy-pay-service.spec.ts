import { TestBed } from '@angular/core/testing';

import { EasyPayService } from './easy-pay-service';

describe('EasyPayService', () => {
  let service: EasyPayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EasyPayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
