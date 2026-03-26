import { Component, OnInit, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface OrderItem {
  stockCategory: string;
  itemName: string;
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
export class SalesOrderComponent implements OnInit {
  // Header Data
  orderNo = 'SO-25-26-001';
  partyName = 'sriram';
  purchaseLedger = 'VAT Purchase A/c';
  date = '26-03-2026';
  narration = '';
  placedBy = 'Sakthi';
  approvedBy = 'Manager';

  items: OrderItem[] = [
    {
      stockCategory: 'Jelly',
      itemName: 'Baby & Me Jelly B/S 2doz',
      qty: 500,
      unit: 'Pcs',
      rate: 1000,
      discPercent: 5,
      vatPercent: 7.5,
    },
    {
      stockCategory: 'Jelly',
      itemName: 'Baby & Me Jelly S/S [150g]',
      qty: 250,
      unit: 'Pcs',
      rate: 750,
      discPercent: 5,
      vatPercent: 7.5,
    },
  ];

  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;

  ngOnInit() {}

  // --- Formatting Helpers ---
  formatNaira(val: number): string {
    return `₦ ${val.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // --- Calculations ---
  getNetRate(item: OrderItem): number {
    const discAmt = (item.rate * item.discPercent) / 100;
    return item.rate - discAmt;
  }

  getAmount(item: OrderItem): number {
    return item.qty * this.getNetRate(item);
  }

  getTotalAmt(item: OrderItem): number {
    const amt = this.getAmount(item);
    return amt + (amt * item.vatPercent) / 100;
  }

  // --- Totals ---
  getTotalQty() {
    return this.items.reduce((s, i) => s + i.qty, 0);
  }
  // Add these to your class
  getGrandRate(): number {
    return this.items.reduce((s, i) => s + Number(i.rate), 0);
  }

  getGrandNetRate(): number {
    return this.items.reduce((s, i) => s + this.getNetRate(i), 0);
  }
  getGrandAmount() {
    return this.items.reduce((s, i) => s + this.getAmount(i), 0);
  }
  getGrandTotal() {
    return this.items.reduce((s, i) => s + this.getTotalAmt(i), 0);
  }

  addNewRow() {
    this.items.push({
      stockCategory: '',
      itemName: '',
      qty: 0,
      unit: 'Pcs',
      rate: 0,
      discPercent: 0,
      vatPercent: 7.5,
    });
  }

  onEnter(event: any, index: number) {
    event.preventDefault();
    const inputs = this.inputFields.toArray();
    if (index + 1 < inputs.length) {
      inputs[index + 1].nativeElement.focus();
      inputs[index + 1].nativeElement.select();
    }
  }
}
