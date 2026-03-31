import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

const MASTER_ROUTE_MAP: { [key: string]: string} = {
  'Customer Master': 'customer',
  'Inventory Master': 'inventory'
}

@Component({
  selector: 'app-update-fetch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './update_fetch_master.html',
  styleUrls: ['./update_fetch_master.css'],
})
export class UpdateFetchComponent {
  updateTitle: string = '';
  columns: string[] = [];
  dataKeys: string[] = [];
  // observable instead of array
  groups$!: Observable<any[]>;
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.groups$ = this.route.queryParams.pipe(
      // delay(0),
      tap(() => (this.loading = true)),

      switchMap((params) => {
        const title = params['title'] || 'Master';
        this.updateTitle = title + ' Update';

        const config = this.getConfig(title);

        this.columns = config.columns;
        this.dataKeys = config.keys;

        return this.http.get<any[]>(config.api).pipe(map((res) => res.map(config.mapper)));
      }),

      tap(() => (this.loading = false)),
    );
  }

  // 🔥 Separate config (clean code)
  getConfig(title: string) {
    const config: any = {
      'Customer Master': {
        columns: ['Code', 'Mail ID', 'Name', 'Region', 'Sales Executive'],
        keys: ['code', 'email', 'name', 'region', 'salesExec'],
        api: 'http://localhost:8080/api/v1/customers',
        mapper: (item: any) => ({
          id: item.id,
          code: item.customerCode,
          email: item.customerMailId,
          name: item.customerName,
          region: item.customerRegion,
          salesExec: item.customerSalesExecutiveName,
        }),
      },

      'Inventory Master': {
        columns: ['Code', 'Name', 'Category', 'UOM', 'Rate'],
        keys: ['code', 'name', 'category', 'uom', 'rate'],
        api: 'http://localhost:8080/api/v1/stock-items',
        mapper: (item: any) => {
          const activeRateEntry = item.rateMasterTables?.find(
            (r: any) => r.rateMasterStatus?.toLowerCase() === 'active'
          );

          return {
            id: item.id,
            code: item.stockItemCode,
            name: item.stockItemName,
            category: item.stockItemCategory,
            uom: item.uom,
            rate: activeRateEntry ? Number(activeRateEntry.rateMasterRate) : 0
          }
        },
      },
    };

    return config[title] || config['Customer Master'];
  }

    navigateToDetail(item: any) {
    const cleanTitle = this.updateTitle.replace(' Update', '').trim();
    const routeSegment = MASTER_ROUTE_MAP[cleanTitle];

    const identifier = item.id || item.code;

    if (routeSegment) {
      this.router.navigate([`/${routeSegment}/update`, identifier]);
    } else {
      console.warn(`No routing configuration found for title: ${cleanTitle}`);
    }
  }

   // Add this method inside your DisplayFetchComponent class
formatToNaira(value: any): string {
  const num = parseFloat(value) || 0;
  return `₦ ${num.toLocaleString('en-NG', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

  goBack() {
    this.location.back();
  }
}
