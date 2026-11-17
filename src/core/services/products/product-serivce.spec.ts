import { TestBed } from '@angular/core/testing';

import { ProductSerivce } from './product-serivce';

describe('ProductSerivce', () => {
  let service: ProductSerivce;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductSerivce);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
