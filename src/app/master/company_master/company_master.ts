import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-company-master',
  standalone: true, // ✅ IMPORTANT
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company_master.html',
  styleUrls: ['./company_master.css'],
})
export class CompanyMasterComponent implements OnInit {
  companyForm!: FormGroup;
  apiUrl = 'http://localhost:8080/api/v1/customers';

  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.companyForm = this.fb.group({
      id: [null],
      customerCode: ['', Validators.required],
      customerName: ['', Validators.required],
      customerMailId: ['', [Validators.required, Validators.email]],
      customerRegion: ['', Validators.required],
      customerSalesExecutiveName: ['', Validators.required],
    });
  }

  // auto focus first field after load
  ngAfterViewInit() {
    setTimeout(() => {
      this.inputFields.first?.nativeElement.focus();
    }, 100);
  }

  onEnter(event: KeyboardEvent, index: number) {
    event.preventDefault();

    const inputs = this.inputFields.toArray();

    if (index + 1 < inputs.length) {
      inputs[index + 1].nativeElement.focus();
    } else {
      this.onSubmit();
    }
  }

  // 🔥 ESC → go back
  @HostListener('document:keydown.escape')
  handleEscape() {
    this.goBack();
  }

  onSubmit() {
    if (this.companyForm.invalid) {
      alert('Please fill all required fields');
      return;
    }

    const formData = this.companyForm.value;

    if (formData.id) {
      this.http.put(`${this.apiUrl}/${formData.id}`, formData).subscribe({
        next: () => {
          alert('Updated successfully');
          this.resetForm();
        },
        error: (err) => console.error(err),
      });
    } else {
      this.http.post(this.apiUrl, formData).subscribe({
        next: () => {
          alert('Created successfully');
          this.resetForm();
        },
        error: (err) => console.error(err),
      });
    }
  }

  resetForm() {
    this.companyForm.reset();

    // ✅ wait for DOM update, then focus first input
    setTimeout(() => {
      const inputs = this.inputFields.toArray();
      inputs[0]?.nativeElement.focus();
    }, 0);
  }

  goBack() {
    this.location.back();
  }

  // 🔠 Convert to UPPERCASE
toUpperCase(event: Event) {
  const input = event.target as HTMLInputElement;
  const value = input.value.toUpperCase();

  input.value = value;
  this.companyForm.get('customerCode')?.setValue(value, { emitEvent: false });
}


// 🧠 Capitalize Each Word
capitalizeWords(event: Event) {
  const input = event.target as HTMLInputElement;

  // 🧠 Save cursor position
  const start = input.selectionStart;
  const end = input.selectionEnd;

  // 🔤 Capitalize each word
  const formatted = input.value
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());

  // ✅ Update input value
  input.value = formatted;

  // ✅ Restore cursor position (VERY IMPORTANT)
  input.setSelectionRange(start, end);

  // ✅ Update form control without triggering loop
  const controlName = input.getAttribute('formControlName');
  if (controlName) {
    this.companyForm.get(controlName)?.setValue(formatted, { emitEvent: false });
  }
}
}
