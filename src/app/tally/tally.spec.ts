import { TestBed } from '@angular/core/testing';

import { Tally } from './tally';

describe('Tally', () => {
  let service: Tally;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tally);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
