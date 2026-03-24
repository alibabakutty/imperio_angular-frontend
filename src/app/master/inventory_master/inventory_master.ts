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
      rateMasterMrp: '',
      rateMasterRate: '',
      vatPercentage: '',
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
      if (!value) return;

      const normalized = value.toLowerCase().trim();

      if (normalized === 'yes') {
        this.openRateMaster();
      }

      // optional: close when NO
      if (normalized === 'no') {
        this.closeRateMaster();
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.inputFields.first?.nativeElement.focus();
    }, 100);
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

    // ✅ Fix 2: Rename 'rateMasterDetails' to 'rateMasterTables' 
    // ✅ Fix 3: Convert numeric strings to actual numbers
    rateMasterTables: this.rateMasterRows.map(row => ({
      rateMasterDate: row.rateMasterDate,
      rateMasterMrp: Number(row.rateMasterMrp) || 0,
      rateMasterRate: Number(row.rateMasterRate) || 0,
      vatPercentage: Number(row.vatPercentage) || 0,
      rateMasterStatus: row.rateMasterStatus
    }))
  };

  this.http.post(this.apiUrl, payload).subscribe({
    next: () => {
      alert('Created successfully');
      this.resetForm();
    },
    error: (err) => {
      console.error("Backend Error:", err);
      alert('Failed to save. Check if Item Code is unique.');
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

  // 🔙 BACK
  goBack() {
    this.location.back();
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

  addRow() {
    this.rateMasterRows.push({
      rateMasterDate: '',
      rateMasterMrp: '',
      rateMasterRate: '',
      vatPercentage: '',
      rateMasterStatus: 'Inactive',
    });
  }
}
