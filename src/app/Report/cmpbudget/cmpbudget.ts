// import { Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
// import { App } from '../../app';
// import { Router } from '@angular/router';
// import { CookieService } from 'ngx-cookie-service';
// import { environment } from '../../../environments/environment';
// import { Observable } from 'rxjs';
// import { HttpClient } from '@angular/common/http';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Tally } from '../../tally/tally';
// import * as XLSX from 'xlsx';
// import * as FileSaver from 'file-saver';

// @Component({
//   selector: 'app-cmpbudget',
//   imports: [CommonModule,FormsModule],
//   templateUrl: './cmpbudget.html',
//   styleUrl: './cmpbudget.css',
// })
 

  


// export class Cmpbudget implements OnInit {
// [x: string]: any;
//   public budgetData: any[] = []; 
// i: any;
 

//   constructor(
//     private app: App, 
//     private router: Router,
//     private http: HttpClient,
//     private tally:Tally
//    ) {
//     this.app.IsValid = false;
//     this.budgetData=this.tally.budgetData;
       
//   }

//   ngOnInit(): void {
//     this.Tgetdata();
//   }

//   /*
// exportToExcel(): void {
//   console.log(this.budgetData); // check here

//   const worksheet = XLSX.utils.json_to_sheet(this.budgetData);
//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
//   XLSX.writeFile(workbook, 'Report.xlsx');
// }
// */

// @ViewChild('excelTable', { static: false }) table!: ElementRef;

// exportToExcel(): void {
//   const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table.nativeElement);
//   const wb: XLSX.WorkBook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, 'Monthly Budget');
//   XLSX.writeFile(wb, 'Monthly Budget.xlsx');
// }


// isNewYear(current: any, previous: any): boolean {
//   if (!previous) return false;
//   return current.Year !== previous.Year;
// }

// getValue(value: number | null | undefined): number | null {
//   if (value === undefined || value === null || value === 0) {
//     return null;
//   }
//   return value;
// }

// getPercentage(row: any): number | null {
//   const system = row.SystemValue ?? 0;
//   const assign = row.AssignValue ?? 0;

//   if (system === 0) return null;

//   const percent = (system - assign) 

//   return percent === 0 ? null : percent;
// }

 

// Tgetdata(): void {
//   this.TgetMonthlyData().subscribe({
//     next: (res) => {
//       // Use the exact same name as defined above
//       this.budgetData = res;
//       console.log("Data Received:", this.budgetData);       
//     },
//     error: (err: any) => { // Added type 'any' to fix your previous TS error
//       console.error("Error fetching data:", err);
//       if (err.status === 401 || err.status === 403) {

//       //    this.router.navigateByUrl('/login');
//       }
//     }
//   });
// }

// TgetMonthlyData(): Observable<any[]> {
//   const url = environment.userapi + "/Tallyreports/company";
//   return this.http.get<any[]>(url, { withCredentials: true });
// }

//   onback() {
//     this.router.navigateByUrl('/menu');
//   }
// }