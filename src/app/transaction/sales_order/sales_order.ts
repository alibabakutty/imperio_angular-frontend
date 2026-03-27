import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  ElementRef,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LoginService } from '../../login/loginservice';
import { HttpClient } from '@angular/common/http';

interface OrderItem {
  stockCategory: string;
  itemName: string;
  displayName?: string;
  qty: number;
  unit: string;
  rate: number;
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
export class SalesOrderComponent implements OnInit, OnDestroy {
  // Header
  orderNo = 'SO-25-26-001';
  partyName = 'sriram';
  purchaseLedger = 'VAT Purchase A/c';
  date = '26-03-2026';
  narration = '';
  placedBy = 'Sakthi';
  approvedBy = 'Manager';

  items: OrderItem[] = [];
  stockItems: any[] = [];

  isDistributor = false;
  activeSearchIndex: number | null = null;

  filteredItems: any[] = [];
  highlightedIndex: number = -1;

  private roleSub!: Subscription;

  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;
  @ViewChildren('dropdownItem') dropdownItems!: QueryList<ElementRef>;

  constructor(
    private loginService: LoginService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.addNewRow();
    this.fetchStockItems();

    this.roleSub = this.loginService.role$.subscribe((role) => {
      this.isDistributor = role === 'distributor';
    });
  }

  ngOnDestroy() {
    this.roleSub?.unsubscribe();
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
  openDropdown(index: number) {
    this.activeSearchIndex = index;
    this.filteredItems = [...this.stockItems];
    this.highlightedIndex = -1;
  }

  filterItems(value: string) {
    const val = value.toLowerCase();

    this.filteredItems = this.stockItems.filter((p) =>
      `${p.stockItemCategory} - ${p.stockItemName}`.toLowerCase().includes(val),
    );

    this.highlightedIndex = -1;
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

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-cell')) {
      this.closeDropdown();
    }
  }

  // ================= SELECT PRODUCT =================
  // ================= SELECT PRODUCT =================
  selectProduct(item: OrderItem, product: any) {
    // ✅ Only put the category in the input field
    item.stockCategory = product.stockItemCategory;

    // ✅ Store the name separately (it will show in the "Name of Item" column via binding)
    item.itemName = product.stockItemName;

    item.unit = product.uom;

    const activeRate = product.rateMasterTables?.find((r: any) => r.rateMasterStatus === 'active');

    item.rate = Number(activeRate?.rateMasterRate) || 0;
    item.vatPercent = Number(activeRate?.vatPercentage) || 0;

    this.closeDropdown();
  }

  // ================= CALCULATIONS =================
  getNetRate(item: OrderItem): number {
    const rate = Number(item.rate) || 0;
    const disc = Number(item.discPercent) || 0;
    return rate - (rate * disc) / 100;
  }

  getAmount(item: OrderItem): number {
    return (Number(item.qty) || 0) * this.getNetRate(item);
  }

  getTotalAmt(item: OrderItem): number {
    const amt = this.getAmount(item);
    const vat = Number(item.vatPercent) || 0;
    return amt + (amt * vat) / 100;
  }

  getTotalQty() {
    return this.items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
  }

  getGrandRate() {
    return this.items.reduce((s, i) => s + (Number(i.rate) || 0), 0);
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
      qty: 0,
      unit: 'Pcs',
      rate: 0,
      discPercent: 0,
      vatPercent: 0,
    });
  }

  onEnter(event: any) {
    event.preventDefault();

    const inputs = this.inputFields.toArray();
    const index = inputs.findIndex((el) => el.nativeElement === event.target);

    if (index + 1 < inputs.length) {
      inputs[index + 1].nativeElement.focus();
      inputs[index + 1].nativeElement.select();
    } else {
      this.addNewRow();
      setTimeout(() => {
        this.inputFields.last.nativeElement.focus();
      }, 50);
    }
  }
}
