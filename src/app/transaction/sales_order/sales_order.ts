import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  ElementRef,
  OnDestroy,
  HostListener,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { LoginService } from '../../login/loginservice';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

interface OrderItem {
  stockCategory: string;
  itemName: string;
  displayName?: string;
  itemQuantity: number;
  unit: string;
  itemRate: number;
  discPercent: number;
  vatPercent: number;
}

@Component({
  selector: 'app-sales-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales_order.html',
  styleUrls: ['./sales_order.css'],
})
export class SalesOrderComponent implements OnInit, AfterViewInit, OnDestroy {
  // Header
  orderNumber = 'Loading....';
  partyName = '';
  ledgerName = 'VAT Purchase A/c';
  orderDate = this.getTodayDate();
  narration = '';
  placedBy = '';
  approvedBy = '';
  items: OrderItem[] = [];
  stockItems: any[] = [];
  isUser = false;
  activeSearchIndex: number | null = null;
  filteredItems: any[] = [];
  highlightedIndex: number = 0;
  focusedCell: string | null = null;
  orderId: string | null = null;

  private roleSub!: Subscription;
  private userSub!: Subscription;

  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;
  @ViewChildren('dropdownItem') dropdownItems!: QueryList<ElementRef>;

  constructor(
    private loginService: LoginService,
    private http: HttpClient,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    // subscribe to params instead of using snapshot for better refresh handling
    this.route.paramMap.subscribe((params) => {
      this.orderId = params.get('orderNumber');

      this.http.get<any[]>('http://localhost:8080/api/v1/stock-items').subscribe({
        next: (stockData) => {
          this.stockItems = stockData;
          this.filteredItems = [...stockData];

          if (this.orderId) {
            this.fetchOrderForUpdate(this.orderId);
          } else {
            // normal create mode
            this.addNewRow();
            this.fetchNextOrderNumber();
          }

          // this.addNewRow();
          this.fetchStockItems();
          // this.fetchNextOrderNumber();

          this.roleSub = this.loginService.role$.subscribe((role) => {
            this.isUser = role === 'user';
          });

          this.userSub = this.loginService.user$.subscribe((username) => {
            if (username) {
              this.partyName = username;
              // automatically set 'order created by' if it's currently empty
              if (!this.placedBy) {
                this.placedBy = username;
              }
            }
          });
        },
      });
    });
  }

  fetchOrderForUpdate(orderNumber: string) {
    this.http
      .get<any[]>(`http://localhost:8080/api/v1/sales-orders/number/${orderNumber}`)
      .subscribe({
        next: (data) => {
          if (!data || data.length === 0) {
            console.error('No order found');
            return;
          }

          // ✅ Use first record for header
          const first = data[0];
          this.orderNumber = first.orderNumber;
          this.partyName = first.customerName;
          this.ledgerName = first.ledgerName;
          this.orderDate = this.formatDateForUI(first.orderDate);
          this.narration = first.narration;
          this.placedBy = first.orderPlacedBy;
          this.approvedBy = first.orderApprovedBy;

          // ✅ IMPORTANT: map ALL items
          this.items = data.map((order) => ({
            stockCategory: order.stockCategory,
            itemName: order.itemName,
            itemQuantity: order.itemQuantity,
            unit: order.uom,
            itemRate: order.itemRate,
            discPercent: order.discountPercentage,
            vatPercent: order.vatPercentage,
          }));
          setTimeout(() => {
            this.focusFirstInput();
          }, 200);
        },
        error: (err) => console.error('Error fetching order:', err),
      });
  }

  formatDateForUI(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-'); // 2026-03-30
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.focusFirstInput();
    }, 100);
  }

  focusFirstInput() {
    const firstInput = this.inputFields?.first;
    if (firstInput) {
      firstInput.nativeElement.focus();
    }
  }

  ngOnDestroy() {
    this.roleSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  getTodayDate(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = now.getFullYear();

    return `${day}-${month}-${year}`;
  }

  // ================= API =================
  fetchStockItems() {
    this.http.get<any[]>('http://localhost:8080/api/v1/stock-items').subscribe({
      next: (data) => {
        this.stockItems = data;
        this.filteredItems = data;
      },
      error: (err) => console.error('Error fetching stock:', err),
    });
  }

  // ================= DROPDOWN =================
  // sales-order.component.ts

  openDropdown(index: number) {
    this.activeSearchIndex = index;

    // Ensure we have the full list available immediately
    this.filteredItems = [...this.stockItems];

    // Reset highlight to the top
    this.highlightedIndex = 0;
    // Optional: If you want to highlight the already selected item in the dropdown
    const currentItemName = this.items[index].itemName;
    if (currentItemName) {
      const foundIndex = this.filteredItems.findIndex((p) => p.stockItemName === currentItemName);
      if (foundIndex !== -1) {
        this.highlightedIndex = foundIndex;
      }
    }
    // Use a slight timeout to ensure the DOM is ready for scrolling
    setTimeout(() => this.scrollToActive(), 10);
  }

  filterItems(value: string) {
    const val = value.toLowerCase();

    this.filteredItems = this.stockItems.filter((p) =>
      `${p.stockItemCategory} - ${p.stockItemName}`.toLowerCase().includes(val),
    );

    this.highlightedIndex = this.filteredItems.length > 0 ? 0 : -1;
    setTimeout(() => this.scrollToActive(), 0);
  }

  handleKeyDown(event: KeyboardEvent, item: OrderItem) {
    if (this.activeSearchIndex === null) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (this.highlightedIndex < this.filteredItems.length - 1) {
        this.highlightedIndex++;
      } else {
        this.highlightedIndex = 0;
      }

      this.scrollToActive();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (this.highlightedIndex > 0) {
        this.highlightedIndex--;
      } else {
        this.highlightedIndex = this.filteredItems.length - 1;
      }

      this.scrollToActive();
    } else if (event.key === 'Enter') {
      event.preventDefault();

      // ✅ Only select if user actually navigated
      if (this.highlightedIndex >= 0) {
        const selected = this.filteredItems[this.highlightedIndex];
        if (selected) this.selectProduct(item, selected);
      }
    } else if (event.key === 'Escape') {
      this.closeDropdown();
    }
  }

  scrollToActive() {
    const items = this.dropdownItems?.toArray();
    if (!items?.length) return;

    const el = items[this.highlightedIndex];
    el?.nativeElement.scrollIntoView({ block: 'nearest' });
  }

  closeDropdown() {
    this.activeSearchIndex = null;
  }

  handleFocus(index: number, field: string) {
    this.focusedCell = index + '-' + field;
  }

  handleBlur(index: number, field: keyof OrderItem, event: any) {
    this.focusedCell = null;

    // Get the value from the input
    const inputValue = event.target.value;
    const val = parseFloat(inputValue);

    // Use a type-safe assignment
    // We check if the field exists in our item before assigning
    if (this.items[index]) {
      (this.items[index] as any)[field] = isNaN(val) ? 0 : val;
    }
  }

  formatToNaira(value: any): string {
    const num = parseFloat(value) || 0;
    return `₦ ${num.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-cell')) {
      this.closeDropdown();
    }
  }

  // ================= SELECT PRODUCT =================
  selectProduct(item: OrderItem, product: any) {
    item.stockCategory = product.stockItemCategory;
    item.itemName = product.stockItemName;
    item.unit = product.uom;

    const activeRate = product.rateMasterTables?.find(
      (r: any) => r.rateMasterStatus?.toLowerCase() === 'active',
    );

    item.itemRate = Number(activeRate?.rateMasterRate) || 0;
    item.vatPercent = Number(activeRate?.vatPercentage) || 0;

    this.closeDropdown();

    // Focus the Qty input of the CURRENT row
    setTimeout(() => {
      const rowIndex = this.items.indexOf(item);
      const inputsPerRow = this.isUser ? 3 : 6;
      const qtyInputIndex = rowIndex * inputsPerRow + 2;

      const inputs = this.inputFields.toArray();
      if (inputs[qtyInputIndex]) {
        inputs[qtyInputIndex].nativeElement.focus();
        inputs[qtyInputIndex].nativeElement.select();
      }
    }, 100);
  }

  // ================= CALCULATIONS =================
  getNetRate(item: OrderItem): number {
    const itemRate = Number(item.itemRate) || 0;
    const disc = Number(item.discPercent) || 0;
    return itemRate - (itemRate * disc) / 100;
  }

  getAmount(item: OrderItem): number {
    return (Number(item.itemQuantity) || 0) * this.getNetRate(item);
  }

  getTotalAmt(item: OrderItem): number {
    const amt = this.getAmount(item);
    const vat = Number(item.vatPercent) || 0;
    return amt + (amt * vat) / 100;
  }

  getTotalQty() {
    return this.items.reduce((s, i) => s + (Number(i.itemQuantity) || 0), 0);
  }

  getGrandRate() {
    return this.items.reduce((s, i) => s + (Number(i.itemRate) || 0), 0);
  }

  getGrandNetRate() {
    return this.items.reduce((s, i) => s + this.getNetRate(i), 0);
  }

  getGrandAmount() {
    return this.items.reduce((s, i) => s + this.getAmount(i), 0);
  }

  getGrandTotal() {
    return this.items.reduce((s, i) => s + this.getTotalAmt(i), 0);
  }

  formatNaira(val: number): string {
    return `₦ ${val.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  }

  // ================= ROW CONTROL =================
  addNewRow() {
    this.items.push({
      stockCategory: '',
      itemName: '',
      itemQuantity: 0,
      unit: 'PCS',
      itemRate: 0,
      discPercent: 0,
      vatPercent: 0,
    });
  }

  onEnter(event: any, fieldType?: string, rowIndex?: number) {
    event.preventDefault();

    const isLastRow = rowIndex === this.items.length - 1;

    // 1. Check if we should add a new row
    // For User: Add after Qty
    const shouldAddUser = this.isUser && fieldType === 'itemQuantity';
    // For Standard: Add after VAT % (the last input in the row)
    const shouldAddStandard = !this.isUser && fieldType === 'vatPercent';

    if (isLastRow && (shouldAddUser || shouldAddStandard)) {
      this.addNewRowWithFocus();
      return;
    }

    // 2. Otherwise, just move to the next available input
    const inputs = this.inputFields.toArray();
    const index = inputs.findIndex((el) => el.nativeElement === event.target);

    if (index !== -1 && index + 1 < inputs.length) {
      inputs[index + 1].nativeElement.focus();
      // Use select() to highlight text for easier overwriting
      if (inputs[index + 1].nativeElement.select) {
        inputs[index + 1].nativeElement.select();
      }
    }
  }

  focusFirstInputOfLastRow() {
    const inputs = this.inputFields.toArray();
    // The first input of the last row is always (Total Inputs - Inputs In One Row)
    const inputsPerRow = this.isUser ? 3 : 6;
    const targetIndex = inputs.length - inputsPerRow;

    if (inputs[targetIndex]) {
      inputs[targetIndex].nativeElement.focus();
    }
  }

  addNewRowWithFocus() {
    this.addNewRow();
    // Wait for Angular to render the new row before trying to focus it
    setTimeout(() => {
      this.focusFirstInputOfLastRow();
    }, 50);
  }

  fetchNextOrderNumber() {
    const prefix = 'SO-25-26-'; // You could also generate this based on current date

    this.http.get<any[]>('http://localhost:8080/api/v1/sales-orders').subscribe({
      next: (orders) => {
        // If no orders exist at all in the DB
        if (!orders || orders.length === 0) {
          this.orderNumber = prefix + '001';
          return;
        }

        // Extract numeric suffixes from orders that match our prefix
        const numericParts = orders
          .map((o) => o.orderNumber)
          .filter((no) => no && no.startsWith(prefix))
          .map((no) => {
            const parts = no.split('-');
            // If format is SO-25-26-001, parts[3] is '001'
            return parseInt(parts[parts.length - 1], 10);
          })
          .filter((num) => !isNaN(num));

        // Find the highest existing number
        const maxSuffix = numericParts.length > 0 ? Math.max(...numericParts) : 0;

        // Increment and Pad (0 becomes 001, 1 becomes 002, etc.)
        const nextSuffix = maxSuffix + 1;
        this.orderNumber = prefix + nextSuffix.toString().padStart(3, '0');
      },
      error: (err) => {
        console.error('Error fetching order numbers:', err);
        this.orderNumber = prefix + '001'; // Fallback if API fails
      },
    });
  }

  // ================= SUBMIT DATA =================
  async createSalesOrder() {
    // 1. Final check against the database to see if this number was taken while we were typing
    this.http.get<any[]>(`http://localhost:8080/api/v1/sales-orders`).subscribe({
      next: (orders) => {
        const isOccupied = orders.some((o) => o.orderNumber === this.orderNumber);

        if (isOccupied) {
          alert(
            `Warning: ${this.orderNumber} was just taken by another user. Auto-incrementing...`,
          );
          this.fetchNextOrderNumber(); // Refresh to the actual next number
          return; // Stop the submission so the user can review the new number
        }

        // 2. Proceed with the Flat Structure loop if not occupied
        this.proceedToSave();
      },
    });
  }

  // Move your existing saving loop into this helper function
  proceedToSave() {
    const validItems = this.items.filter((i) => i.itemName && i.itemQuantity > 0);

    if (validItems.length === 0) {
      alert('Please add at least one valid item.');
      return;
    }
    const currentNo = this.orderNumber;

    // create an array of observable (POST request)
    const requests = validItems.map((item) => {
      const payload = {
        orderNumber: currentNo,
        customerName: this.partyName,
        ledgerName: this.ledgerName,
        orderDate: this.formatDateForBackend(this.orderDate),
        stockCategory: item.stockCategory,
        itemName: item.itemName,
        itemQuantity: item.itemQuantity,
        uom: item.unit,
        itemRate: item.itemRate,
        discountPercentage: item.discPercent,
        vatPercentage: item.vatPercent,
        narration: this.narration,
        orderPlacedBy: this.placedBy,
        orderApprovedBy: this.approvedBy,
        itemNetRate: this.getNetRate(item),
        itemNetAmount: this.getAmount(item),
        totalAmount: this.getTotalAmt(item),
        grossTotalAmount: this.getGrandTotal(),
        grossItemQuantity: this.getTotalQty(),
      };
      return this.http.post('http://localhost:8080/api/v1/sales-orders', payload);
    });

    // execute all requests and await for compilation
    forkJoin(requests).subscribe({
      next: () => {
        alert('Order saved successfully!');
        this.resetForm();
        this.fetchNextOrderNumber();
      },
      error: (err) => {
        console.error('Error saving order:', err);
        alert('An error occured while saving the order.');
      },
    });
  }

  formatDateForBackend(dateStr: string): string {
    const parts = dateStr.split('-');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  // Optional helper to clear form after success
  resetForm() {
    // reset the items array to a single empty row
    this.items = [
      {
        stockCategory: '',
        itemName: '',
        itemQuantity: 0,
        unit: 'pcs',
        itemRate: 0,
        discPercent: 0,
        vatPercent: 0,
      },
    ];
    // clear footer/header fields
    this.narration = '';
    this.approvedBy = '';
    this.orderDate = this.getTodayDate();
    // keep the current user as placedby instead of making it empty
    this.placedBy = this.partyName;
    // reset UI states
    this.activeSearchIndex = null;
    this.highlightedIndex = 0;
    // Re-focus the first field
    setTimeout(() => this.focusFirstInput(), 100);
  }

  proceedToUpdate() {
    const validItems = this.items.filter((i) => i.itemName && i.itemQuantity > 0);
    const requests = validItems.map((item) => {
      const payload = {
        // Include ID in payload if your backend needs it
        orderNumber: this.orderNumber,
        customerName: this.partyName,
        ledgerName: this.ledgerName,
        orderDate: this.formatDateForBackend(this.orderDate),
        stockCategory: item.stockCategory,
        itemName: item.itemName,
        itemQuantity: item.itemQuantity,
        uom: item.unit,
        itemRate: item.itemRate,
        discountPercentage: item.discPercent,
        vatPercentage: item.vatPercent,
        narration: this.narration,
        orderPlacedBy: this.placedBy,
        orderApprovedBy: this.approvedBy,
        itemNetRate: this.getNetRate(item),
        itemNetAmount: this.getAmount(item),
        totalAmount: this.getTotalAmt(item),
        grossTotalAmount: this.getGrandTotal(),
        grossItemQuantity: this.getTotalQty(),
      };

      // Use PUT for updates
      return this.http.put(
        `http://localhost:8080/api/v1/sales-orders/number/${this.orderNumber}`,
        payload,
      );
    });

    forkJoin(requests).subscribe({
      next: () => alert('Order updated successfully!'),
      error: (err) => alert('Error updating order.'),
    });
  }
}
