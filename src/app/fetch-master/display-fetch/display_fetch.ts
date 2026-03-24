import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
          code: item.customerCode,
          email: item.customerMailId,
          name: item.customerName,
          region: item.customerRegion,
          salesExec: item.customerSalesExecutiveName,
        }),
      },

      'Inventory Master': {
        columns: ['Code', 'Name', 'Category', 'UOM'],
        keys: ['code', 'name', 'category', 'uom'],
        api: 'http://localhost:8080/api/v1/stock-items',
        mapper: (item: any) => ({
          code: item.stockItemCode,
          name: item.stockItemName,
          category: item.stockItemCategory,
          uom: item.uom,
        }),
      },
    };

    return config[title] || config['Customer Master'];
  }

  goBack() {
    this.location.back();
  }
}
