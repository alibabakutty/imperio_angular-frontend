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
import { ActivatedRoute } from '@angular/router';

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
  isReadOnly: boolean = false;
  isLoading: boolean = false;
  showRateMaster = false;

  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private location: Location,
    private route: ActivatedRoute
  ) {}

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
    this.initForm();
    // capture id and mode from url
    const id = this.route.snapshot.paramMap.get('id');
    this.isReadOnly = this.route.snapshot.url.some(segment => segment.path === 'display');

    if (id) {
      this.fetchInventoryData(id);
    }
    // ✅ 🔥 LISTEN TO RATE MASTER CHANGES
    this.inventoryForm.get('rateMaster')?.valueChanges.subscribe((value) => {
      if (value?.toLowerCase().trim() === 'yes') this.openRateMaster();
    });
  }

  initForm() {
    this.inventoryForm = this.fb.group({
      id: [null],
      stockItemCode: ['', Validators.required],
      stockItemName: ['', Validators.required],
      stockItemDescription: ['', Validators.required],
      stockItemCategory: ['', Validators.required],
      uom: ['', Validators.required],
      rateMaster: ['No', Validators.required],
    });
  }

  fetchInventoryData(id: string) {
    this.isLoading = true;
    this.http.get<any>(`${this.apiUrl}/${id}`).subscribe({
      next: (data) => {
        // map main fields
        this.inventoryForm.patchValue({
          id: data.id,
          stockItemCode: data.stockItemCode,
          stockItemName: data.stockItemName,
          stockItemDescription: data.stockItemDescription,
          stockItemCategory: data.stockItemCategory,
          uom: data.uom,
          rateMaster: data.rateMaster ? 'Yes' : 'No'
        });
        // map table rows
        if (data.rateMasterTables && data.rateMasterTables.length > 0) {
          this.rateMasterRows = data.rateMasterTables.map((row: any) => ({
            rateMasterDate: this.formatFromIsoDate(row.rateMasterDate),
            rateMasterMrp: row.rateMasterMrp,
            rateMasterRate: row.rateMasterRate,
            vatPercentage: row.vatPercentage,
            rateMasterStatus: row.rateMasterStatus
          }));
        }

        if (this.isReadOnly) {
          this.inventoryForm.disable();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    })
  }

  // date parse helper for fetch from database
  formatFromIsoDate(isoStr: string): string {
    if (!isoStr) return '';
    const [year, month, day] = isoStr.split('-');
    return `${day}-${month}-${year}`;
  }

  ngAfterViewInit() {
    if (!this.isReadOnly) {
      setTimeout(() => this.inputFields.first?.nativeElement.focus(), 100);
    }
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

  onTableEnter(event: any, rowIndex: number, colName: string) {
    if (this.isReadOnly) return;

    // Only trigger if Enter is pressed
    if (event.key !== 'Enter') return;
    event.preventDefault();

    // If we are on the 'status' column, handle row creation/navigation
    if (colName === 'status') {
      // const currentRow = this.rateMasterRows[rowIndex];
      // Check if this is the last row in the array
      if (rowIndex === this.rateMasterRows.length - 1) {
        // Logic: If status is entered, create a new blank row
        this.addNewRateRow();

        // Focus the first field of the NEW row after a tiny delay
        setTimeout(() => {
          const nextRowDateInput = document.getElementById(
            `date-${rowIndex + 1}`,
          ) as HTMLInputElement;
          nextRowDateInput?.focus();
        }, 50);
      } else {
        // If not the last row, just move focus to the date field of the next existing row
        const nextRowDateInput = document.getElementById(
          `date-${rowIndex + 1}`,
        ) as HTMLInputElement;
        nextRowDateInput?.focus();
      }
    } else {
      // If we are in MRP, Rate, or VAT, move focus to the next input in the SAME row
      const columnOrder = ['date', 'mrp', 'rate', 'vat', 'status'];
      const nextColIndex = columnOrder.indexOf(colName) + 1;
      const nextColName = columnOrder[nextColIndex];

      const nextInput = document.getElementById(`${nextColName}-${rowIndex}`) as HTMLInputElement;
      nextInput?.focus();
      nextInput?.select(); // Select text for easier overwriting
    }
  }

  // Row actions
  addNewRateRow() {
    if(this.isReadOnly) return;

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

  // 🔥 ENTER NAVIGATION
  onEnter(event: KeyboardEvent, index: number) {
    if (this.isReadOnly) return;
    event.preventDefault();

    const inputs = this.inputFields.toArray();

    if (index + 1 < inputs.length) {
      inputs[index + 1].nativeElement.focus();
      inputs[index + 1].nativeElement.select();
    } else {
      this.onSubmit();
    }
  }

  // 🔥 SUBMIT
  onSubmit() {
    if (this.isReadOnly) return;
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

      rateMasterTables: this.rateMasterRows.map((row) => ({
        rateMasterDate: this.formatToIsoDate(row.rateMasterDate),
        rateMasterMrp: parseFloat(parseFloat(row.rateMasterMrp).toFixed(2)) || 0,
        rateMasterRate: parseFloat(parseFloat(row.rateMasterRate).toFixed(2)) || 0,
        vatPercentage: parseFloat(parseFloat(row.vatPercentage).toFixed(2)) || 0,
        rateMasterStatus: row.rateMasterStatus,
      })),
    };

    console.log('Final Payload to Backend:', payload);

    this.http.post(this.apiUrl, payload).subscribe({
      next: () => {
        alert('Inventory saved successfully!');
        this.resetForm();
      },
      error: (err) => {
        console.error('Full Backend Error:', err);
        alert('Backend Error: Check IntelliJ logs for the specific stack trace.');
      },
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

  onStatusInput(event: any, index: number) {
    const value = event.target.value;
    if (!value) return;

    // Get only the last character typed
    const lastChar = value.slice(-1).toLowerCase();

    if (lastChar === 'a') {
      this.rateMasterRows[index].rateMasterStatus = 'Active';
    } else if (lastChar === 'i') {
      this.rateMasterRows[index].rateMasterStatus = 'Inactive';
    } else {
      // If they type anything else, keep the current value or clear it
      // This prevents "Activeii" from appearing
      const current = this.rateMasterRows[index].rateMasterStatus;
      this.rateMasterRows[index].rateMasterStatus = current;
    }
  }

  onStatusKeydown(event: KeyboardEvent, index: number) {
    const key = event.key.toLowerCase();

    // 1. Handle 'A' for Active
    if (key === 'a') {
      event.preventDefault();
      this.rateMasterRows[index].rateMasterStatus = 'Active';
      return;
    }

    // 2. Handle 'I' for Inactive
    if (key === 'i') {
      event.preventDefault();
      this.rateMasterRows[index].rateMasterStatus = 'Inactive';
      return;
    }

    // 3. Allow Enter key to propagate to (keydown.enter)
    if (key === 'enter') {
      return;
    }

    // 4. Allow standard navigation/edit keys
    const allowedKeys = ['backspace', 'tab', 'arrowleft', 'arrowright', 'delete'];
    if (allowedKeys.includes(key)) {
      return;
    }

    // 5. Block everything else (prevents "ActiveD", "Active123", etc.)
    event.preventDefault();
  }

  onRateMasterKeydown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();

    if (key === 'y') {
      event.preventDefault();
      this.inventoryForm.get('rateMaster')?.setValue('Yes');
      return;
    }

    if (key === 'n') {
      event.preventDefault();
      this.inventoryForm.get('rateMaster')?.setValue('No');
      return;
    }

    // Allow navigation and Enter (so onEnter still works)
    const allowed = ['enter', 'tab', 'backspace', 'arrowleft', 'arrowright', 'delete'];
    if (!allowed.includes(key)) {
      event.preventDefault();
    }
  }

  openRateMaster() {
    this.showRateMaster = true;
  }

  closeRateMaster() {
    this.showRateMaster = false;
  }
}
