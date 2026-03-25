import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerMasterComponent } from './customer_master';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CustomerMasterComponent', () => {
  let component: CustomerMasterComponent;
  let fixture: ComponentFixture<CustomerMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerMasterComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});