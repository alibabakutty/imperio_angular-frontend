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
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-customer-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer_master.html',
  styleUrls: ['./customer_master.css'],
})
export class CustomerMasterComponent implements OnInit {
  customerForm!: FormGroup;
  apiUrl = 'http://localhost:8080/api/v1/customers';
  isReadOnly: boolean = false;
  isLoading: boolean = false;

  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private location: Location,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.initForm();
    // capture id and mode from url
    const id = this.route.snapshot.paramMap.get('id');
    // check if url contains 'display'
    this.isReadOnly = this.route.snapshot.url.some((segment) => segment.path === 'display');

    if (id) {
      this.fetchCustomerData(id);
    }
  }

  initForm() {
    this.customerForm = this.fb.group({
      id: [null],
      customerCode: ['', Validators.required],
      customerName: ['', Validators.required],
      customerMailId: ['', [Validators.required, Validators.email]],
      customerRegion: ['', Validators.required],
      customerSalesExecutiveName: ['', Validators.required],
    });
  }

  fetchCustomerData(id: string) {
    this.isLoading = true;
    this.http.get<any>(`${this.apiUrl}/${id}`).subscribe({
      next: (data) => {
        this.customerForm.patchValue({
          id: data.id,
          customerCode: data.customerCode,
          customerName: data.customerName,
          customerMailId: data.customerMailId,
          customerRegion: data.customerRegion,
          customerSalesExecutiveName: data.customerSalesExecutiveName,
        });
        // if readonly disable entire form
        if (this.isReadOnly) {
          this.customerForm.disable();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Fetch failed:', err);
        this.isLoading = false;
      },
    });
  }

  // auto focus first field after load
  ngAfterViewInit() {
    setTimeout(() => {
      this.inputFields.first?.nativeElement.focus();
    }, 100);
  }

  // but update onEnter to ignore if readOnly
  onEnter(event: KeyboardEvent, index: number) {
    if (this.isReadOnly) return;

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
    if (this.isReadOnly) return;
    if (this.customerForm.invalid) {
      alert('Please fill all required fields correctly.');
      return;
    }

    // Use getRawValue() to ensure 'id' is included even if control is disabled
    const formData = this.customerForm.getRawValue();
    const id = formData.id;

    if (id) {
      // 🔥 UPDATE MODE (PUT)
      this.isLoading = true;
      this.http.put(`${this.apiUrl}/${id}`, formData).subscribe({
        next: () => {
          alert('Customer updated successfully!');
          this.isLoading = false;
          this.goBack();
        },
        error: (err) => {
          console.error('Update failed:', err);
          alert('Error updating customer.');
          this.isLoading = false;
        }
      });
    } else {
      // 🔥 CREATE MODE (POST)
      this.http.post(this.apiUrl, formData).subscribe({
        next: () => {
          alert('Customer created successfully!');
          this.resetForm();
        },
        error: (err) => console.error('Creation failed:', err)
      });
    }
  }

  resetForm() {
    this.customerForm.reset();

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
    this.customerForm.get('customerCode')?.setValue(value, { emitEvent: false });
  }

  // 🧠 Capitalize Each Word
  capitalizeWords(event: Event) {
    const input = event.target as HTMLInputElement;

    // 🧠 Save cursor position
    const start = input.selectionStart;
    const end = input.selectionEnd;

    // 🔤 Capitalize each word
    const formatted = input.value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

    // ✅ Update input value
    input.value = formatted;

    // ✅ Restore cursor position (VERY IMPORTANT)
    input.setSelectionRange(start, end);

    // ✅ Update form control without triggering loop
    const controlName = input.getAttribute('formControlName');
    if (controlName) {
      this.customerForm.get(controlName)?.setValue(formatted, { emitEvent: false });
    }
  }
}
