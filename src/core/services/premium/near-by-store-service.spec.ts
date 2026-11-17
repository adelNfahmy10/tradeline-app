import { TestBed } from '@angular/core/testing';

import { NearByStoreService } from './near-by-store-service';

describe('NearByStoreService', () => {
  let service: NearByStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NearByStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
