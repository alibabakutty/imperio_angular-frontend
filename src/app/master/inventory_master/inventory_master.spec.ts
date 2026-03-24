import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryMasterComponent } from './inventory_master';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';

describe('InventoryMasterComponent', () => {
  let component: InventoryMasterComponent;
  let fixture: ComponentFixture<InventoryMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InventoryMasterComponent],
      imports: [
        InventoryMasterComponent,     // ✅ standalone component
        HttpClientTestingModule,      // ✅ for HttpClient
        ReactiveFormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ✅ Basic test
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ✅ Form should be invalid initially
  it('should have invalid form when empty', () => {
    expect(component.inventoryForm.valid).toBe(false);
  });

  // ✅ Form valid when filled
  it('should be valid when all fields are filled', () => {
    component.inventoryForm.setValue({
      id: null,
      stockItemCode: 'ITEM001',
      stockItemName: 'Test Item',
      stockItemDescription: 'Sample Desc',
      stockItemCategory: 'Category A',
      uom: 'PCS',
      rateMaster: 'Yes'
    });

    expect(component.inventoryForm.valid).toBe(true);
  });

  // ✅ Test uppercase function
  it('should convert to uppercase', () => {
    const event = {
      target: {
        value: 'abc',
        selectionStart: 3,
        setSelectionRange: () => {},
        getAttribute: () => 'stockItemCode'
      }
    } as any;

    component.toUpperCase(event);
    expect(event.target.value).toBe('ABC');
  });

});