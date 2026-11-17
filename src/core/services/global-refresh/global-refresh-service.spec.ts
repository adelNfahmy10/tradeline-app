import { TestBed } from '@angular/core/testing';

import { GlobalRefreshService } from './global-refresh-service';

describe('GlobalRefreshService', () => {
  let service: GlobalRefreshService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalRefreshService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
