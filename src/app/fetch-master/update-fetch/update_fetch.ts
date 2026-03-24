import { Component } from '@angular/core';

interface MainGroup {
  code: string;
  name: string;
  tallyReport: string;
  subReport: string;
  dc: string;
  trialBalance: string;
  status: string;
}

@Component({
  selector: 'app-display-fetch',
  templateUrl: './update_fetch.html',
  styleUrls: ['./update_fetch.css']
})
export class UpdateFetchComponent {
  
  groups: MainGroup[] = [
    { 
      code: 'MG-1001', 
      name: 'Branch / Divisions', 
      tallyReport: 'Balance Sheet', 
      subReport: 'Assets', 
      dc: 'Debit', 
      trialBalance: 'Trial Balance', 
      status: 'Active' 
    },
    { 
      code: 'MG-1002', 
      name: 'Capital Account', 
      tallyReport: 'Balance Sheet', 
      subReport: 'Liabilities', 
      dc: 'Credit', 
      trialBalance: 'Trial Balance', 
      status: 'Active' 
    },
    // Add more mock data here to test scrolling...
  ];

  constructor() { }
}