import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cmpbudget } from './cmpbudget';

describe('Cmpbudget', () => {
  let component: Cmpbudget;
  let fixture: ComponentFixture<Cmpbudget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cmpbudget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cmpbudget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
