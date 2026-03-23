import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Tally } from '../../tally/tally';
import * as XLSX from 'xlsx';
import { App } from '../../app';

@Component({
  selector: 'app-itemmonthly',
  imports: [CommonModule,FormsModule],
  templateUrl: './itemmonthly.html',
  styleUrl: './itemmonthly.css',
})
export class Itemmonthly implements OnInit {

  ItemMonthlyBudget: any[] = [];
  OriginalData: any[] = [];
  filterData: any[] = [];
  Unigroup:any;
  ListUOM:any;
  Months: string[] = ["Januaray","Feburary","March","April","May","June","July","Auguest","September","October","November","December"];
  searchText: string = '';
  selectedItem: string | null = null;
  dropdownOpen = false;
  ProductSubGrp:string='';
  productUom:string='';
  totals: any = {};          // month-wise totals for display
overallTotal:number = 0;  // holds overall sum

  @ViewChild('excelTable', { static: false }) table!: ElementRef;

  constructor(private router: Router, private tally: Tally, private app: App) {
    this.ItemMonthlyBudget = this.tally.budgetItem;
    this.OriginalData = [...this.ItemMonthlyBudget]; // save original data
    this.filterData = [...this.ItemMonthlyBudget];   // initialize filterData
    this.app.isheadValid = false;
  }

 
  filterProduct() {
    const value = this.searchText.toLowerCase();
    
    if (value) {
      this.filterData = this.OriginalData.filter(item =>
        item.Itemname.toLowerCase().includes(value)
        
      );
    } else {
      this.filterData = [...this.OriginalData];
    }
 
 this.computeTotals();
  }


  filterGroup(){
    const PrGrp = this.ProductSubGrp.toLowerCase();

    this.filterData = this.OriginalData.filter(item =>
        item.ItemSubgroup.toLowerCase().includes(PrGrp)
      );
    this.computeTotals();
  }

  FilterUom(){
    const PRUOM = this.productUom.toLowerCase();

      this.filterData = this.OriginalData.filter(item =>
        item.BaseUnits.toLowerCase().includes(PRUOM)
      );
    this.computeTotals();
  }

  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Item Wise Monthly Budget');
    XLSX.writeFile(wb, 'Item Wise Monthly Budget.xlsx');
  }

  onback() {
    this.router.navigateByUrl('/menu');
  }



computeTotals() {
  this.totals = {};
  this.overallTotal = 0;

  // Initialize month-wise totals
  this.Months.forEach(month => this.totals[month] = 0);

  // Sum up month-wise totals
  this.filterData.forEach(row => {
    this.Months.forEach(month => {
      const value = Number(row[month]) || 0;
      this.totals[month] += value;
      this.overallTotal += value; // sum for overall total
    });
  });

  // Keep the 'Total' column in table empty
  this.totals['Total'] = null; 
}
 

  ngOnInit(): void {
      const allGroups=this.ItemMonthlyBudget.map(item=>item.ItemSubgroup);
      this.Unigroup=Array.from(new Set(allGroups));
      const AllUom=this.ItemMonthlyBudget.map(item=>item.BaseUnits);
      this.ListUOM=Array.from(new Set(AllUom));
  }
}