import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  QueryList,
  ViewChildren,
  HostListener,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-inventory-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './inventory_master.html',
  styleUrls: ['./inventory_master.css'],
})
export class InventoryMasterComponent implements OnInit, AfterViewInit {
  inventoryForm!: FormGroup;
  apiUrl = 'http://localhost:8080/api/v1/stock-items';
  focusedCell: string | null = null;

  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private location: Location,
  ) {}

  // 🔹 Modal Control
  showRateMaster = false;

  rateMasterRows: any[] = [
    {
      rateMasterDate: '',
      rateMasterMrp: 0,
      rateMasterRate: 0,
      vatPercentage: 0,
      rateMasterStatus: 'Inactive',
    },
  ];

  ngOnInit(): void {
    this.inventoryForm = this.fb.group({
      id: [null],
      stockItemCode: ['', Validators.required],
      stockItemName: ['', Validators.required],
      stockItemDescription: ['', Validators.required],
      stockItemCategory: ['', Validators.required],
      uom: ['', Validators.required],
      rateMaster: ['No', Validators.required],
    });
    // ✅ 🔥 LISTEN TO RATE MASTER CHANGES
     this.inventoryForm.get('rateMaster')?.valueChanges.subscribe((value) => {
      if (value?.toLowerCase().trim() === 'yes') this.openRateMaster();
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.inputFields.first?.nativeElement.focus(), 100);
  }

  // --- Date Shorthand Logic (1.4.26 -> 01-04-2026) ---
  parseDateInput(event: any, index: number) {
    let input = event.target.value;
    if (!input) return;

    // Standardize separators to dashes
    input = input.replace(/[\.\/]/g, '-');
    let parts = input.split('-');

    if (parts.length === 3) {
      let day = parts[0].padStart(2, '0');
      let month = parts[1].padStart(2, '0');
      let year = parts[2];

      if (year.length === 2) year = '20' + year; // Handle '26' to '2026'

      this.rateMasterRows[index].rateMasterDate = `${day}-${month}-${year}`;
    }
  }

  // --- Date Converter for PostgreSQL (01-04-2026 -> 2026-04-01) ---
  formatToIsoDate(dateStr: string): string | null {
    if (!dateStr || !dateStr.includes('-')) return null;
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
  }

   // --- Currency & Formatting ---
  formatToNaira(value: any): string {
    const num = parseFloat(value) || 0;
    return `₦ ${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  handleFocus(rowIndex: number, colName: string) {
    this.focusedCell = `${rowIndex}-${colName}`;
  }

  handleBlur(rowIndex: number, colName: string, event: any) {
    this.focusedCell = null;
    const val = parseFloat(event.target.value) || 0;
    this.rateMasterRows[rowIndex][colName] = val;
  }

  // Row actions
  addRow() {
    this.rateMasterRows.push({
      rateMasterDate: '',
      rateMasterMrp: 0,
      rateMasterRate: 0,
      vatPercentage: 0,
      rateMasterStatus: 'Inactive',
    });
  }

  removeRow(index: number) {
    if (this.rateMasterRows.length > 1) this.rateMasterRows.splice(index, 1);
  }

  // 🔥 SUBMIT
  onSubmit() {
  if (this.inventoryForm.invalid) {
    alert('Please fill all required fields');
    return;
  }

  // Extract form values
  const formValues = this.inventoryForm.value;

  const payload = {
    stockItemCode: formValues.stockItemCode,
    stockItemName: formValues.stockItemName,
    stockItemDescription: formValues.stockItemDescription,
    stockItemCategory: formValues.stockItemCategory,
    uom: formValues.uom,
    
    // ✅ Fix 1: Convert "Yes"/"No" string to a real Boolean
    rateMaster: formValues.rateMaster.toLowerCase() === 'yes',

    rateMasterTables: this.rateMasterRows.map(row => ({
      rateMasterDate: this.formatToIsoDate(row.rateMasterDate),
      rateMasterMrp: parseFloat(parseFloat(row.rateMasterMrp).toFixed(2)) || 0,
      rateMasterRate: parseFloat(parseFloat(row.rateMasterRate).toFixed(2)) || 0,
      vatPercentage: parseFloat(parseFloat(row.vatPercentage).toFixed(2)) || 0,
      rateMasterStatus: row.rateMasterStatus
    }))
  };

  console.log("Final Payload to Backend:", payload);

  this.http.post(this.apiUrl, payload).subscribe({
    next: () => {
      alert('Inventory saved successfully!');
      this.resetForm();
    },
    error: (err) => {
      console.error("Full Backend Error:", err);
      alert('Backend Error: Check IntelliJ logs for the specific stack trace.');
    }
  });
}

  // 🔄 RESET
  resetForm() {
    this.inventoryForm.reset();

    this.rateMasterRows = [
      {
        rateMasterDate: '',
        rateMasterMrp: '',
        rateMasterRate: '',
        vatPercentage: '',
        rateMasterStatus: 'Inactive',
      },
    ];

    setTimeout(() => {
      this.inputFields.first?.nativeElement.focus();
    }, 0);
  }

  // 🔠 UPPERCASE
  toUpperCase(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase();

    input.value = value;

    const controlName = input.getAttribute('formControlName');
    if (controlName) {
      this.inventoryForm.get(controlName)?.setValue(value, { emitEvent: false });
    }
  }

  // 🧠 CAPITALIZE
  capitalizeWords(event: Event) {
    const input = event.target as HTMLInputElement;

    const start = input.selectionStart;
    const end = input.selectionEnd;

    const formatted = input.value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

    input.value = formatted;
    input.setSelectionRange(start, end);

    const controlName = input.getAttribute('formControlName');
    if (controlName) {
      this.inventoryForm.get(controlName)?.setValue(formatted, { emitEvent: false });
    }
  }


  // 🔥 ENTER NAVIGATION
  onEnter(event: KeyboardEvent, index: number) {
    event.preventDefault();

    const inputs = this.inputFields.toArray();

    if (index + 1 < inputs.length) {
      inputs[index + 1].nativeElement.focus();
      inputs[index + 1].nativeElement.select();
    } else {
      this.onSubmit();
    }
  }

  // 🔥 ESC CLOSE MODAL OR GO BACK
  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.showRateMaster) {
      this.closeRateMaster();
    } else {
      this.goBack();
    }
  }

  // 🔙 BACK
  goBack() {
    this.location.back();
  }

  // 🔥 RATE MASTER MODAL
  onRateMasterChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.toLowerCase().trim();

    if (value === 'yes') {
      this.openRateMaster();
    }
  }

  openRateMaster() {
    this.showRateMaster = true;
  }

  closeRateMaster() {
    this.showRateMaster = false;
  }
}
