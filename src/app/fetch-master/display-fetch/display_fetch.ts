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
  selector: 'app-display-fetch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display_fetch.html',
  styleUrls: ['./display_fetch.css'],
})
export class DisplayFetchComponent {
  displayTitle: string = '';
  columns: string[] = [];
  dataKeys: string[] = [];
  // 🔥 Observable instead of array
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
      tap(() => (this.loading = true)),

      switchMap((params) => {
        const title = params['title'] || 'Master';
        this.displayTitle = title + ' Display';

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
          // find the active rate object in the array
          const activeRateEntry = item.rateMasterTables?.find(
            (r: any) => r.rateMasterStatus?.toLowerCase() === 'active'
          );
          
          return {
            id: item.id,
            code: item.stockItemCode,
            name: item.stockItemName,
            category: item.stockItemCategory,
            uom: item.uom,
            rate: activeRateEntry ? activeRateEntry.rateMasterRate : '0.00'
          }

        },
      },
    };

    return config[title] || config['Customer Master'];
  }

  navigateToDetail(item: any) {
    const cleanTitle = this.displayTitle.replace(' Display', '').trim();
    const routeSegment = MASTER_ROUTE_MAP[cleanTitle];

    const identifier = item.id || item.code;

    if (routeSegment) {
      this.router.navigate([`/${routeSegment}/display`, identifier]);
    } else {
      console.warn(`No routing configuration found for title: ${cleanTitle}`);
      
    }
  }

  goBack() {
    this.location.back();
  }
}
