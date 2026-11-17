import { TestBed } from '@angular/core/testing';

import { OfferSilderService } from './offer-silder-service';

describe('OfferSilderService', () => {
  let service: OfferSilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfferSilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
