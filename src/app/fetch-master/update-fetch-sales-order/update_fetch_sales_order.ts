import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

const MASTER_ROUTE_MAP: { [key: string]: string } = {
  'Sales Order': 'sales_order',
};

@Component({
  selector: 'app-update-fetch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './update_fetch_sales_order.html',
  styleUrls: ['./update_fetch_sales_order.css'],
})
export class UpdateFetchSalesOrder {
  updateTitle: string = 'Sales Order';
  columns: string[] = [];
  dataKeys: string[] = [];
  // observable instead of array
  groups$!: Observable<any[]>;
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private location: Location,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.groups$ = this.route.queryParams.pipe(
      tap(() => (this.loading = true)),
      switchMap((params) => {
        const title = params['title'] || 'Sales Order';
        this.updateTitle = title + ' Update';
        const config = this.getConfig(title);

        if (config) {
          this.columns = config.columns;
          this.dataKeys = config.keys;

          return this.http.get<any[]>(config.api).pipe(
            // ✅ Use the new grouping function here
            map((res) => config.groupingFn(res)),
          );
        } else {
          return [[]];
        }
      }),
      tap(() => (this.loading = false)),
    );
  }

  // 🔥 Separate config (clean code)
  getConfig(title: string) {
    const config: any = {
      'Sales Order': {
        columns: ['Order No', 'Date', 'Party Name', 'Purchase Ledger', 'Amount'],
        keys: ['orderNo', 'date', 'partyName', 'ledgerName', 'amount'],
        api: 'http://localhost:8080/api/v1/sales-orders',
        // We change the pipe logic in ngOnInit to handle grouping
        groupingFn: (res: any[]) => {
          const grouped = res.reduce((acc: any[], current: any) => {
            // Check if we already added this Order Number to our list
            const existingOrder = acc.find((item) => item.orderNumber === current.orderNumber);

            if (existingOrder) {
              // If it exists, just add the current item's totalAmount to the existing total
              existingOrder.totalAmount += current.totalAmount || 0;
            } else {
              // If it doesn't exist, add the whole object to our list
              acc.push({ ...current });
            }
            return acc;
          }, []);

          // Finally, map the grouped results to your table keys
          return grouped.map((item) => ({
            id: item.id,
            orderNo: item.orderNumber,
            date: item.orderDate,
            partyName: item.customerName ? item.customerName.toUpperCase() : '',
            ledgerName: item.ledgerName,
            amount: item.totalAmount,
          }));
        },
      },
    };
    return config[title] || config['Sales Order'];
  }

  navigateToDetail(item: any) {
    const cleanTitle = this.updateTitle.replace(' Update', '').trim();

    const orderNumber = item.orderNo;

    if (cleanTitle === 'Sales Order') {
      this.router.navigate(['/sales_order_update/number', orderNumber]);
    } else {
      // Fallback for other masters if you add them later
      const routeSegment = MASTER_ROUTE_MAP[cleanTitle];
      if (routeSegment) {
        this.router.navigate([`/${routeSegment}_update`, orderNumber]);
      } else {
        console.warn(`No routing configuration found for title: ${cleanTitle}`);
      }
    }
  }

  formatToNaira(value: any): string {
    const num = parseFloat(value) || 0;
    return `₦ ${num.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  goBack() {
    this.location.back();
  }
}
