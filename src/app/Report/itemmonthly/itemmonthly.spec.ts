import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Itemmonthly } from './itemmonthly';

describe('Itemmonthly', () => {
  let component: Itemmonthly;
  let fixture: ComponentFixture<Itemmonthly>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Itemmonthly]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Itemmonthly);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
