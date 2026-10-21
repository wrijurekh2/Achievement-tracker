import { TestBed } from '@angular/core/testing';
import { Steam } from './steam';

describe('Steam', () => {
  let service: Steam;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Steam);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
