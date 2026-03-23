import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Tally {

    budgetData:any[]=[];
    budgetItem:any[]=[];
     constructor(private http:HttpClient){}

 getMenuSections() {
  return [
    { 
      title: 'Master', 
      items: [
       { label: 'Customer Master', hotkey: 'C', path:'company_master' },
        { label: 'Inventory Master', hotkey: 'I',  path:'inventory_master' } // Changed hotkey to 'I' to avoid duplicates
      ] 
    }
  ];
}



    getdata(): void {
  this.getMonthlyData().subscribe({
    next: (res: any) => {
    this.budgetData = res;
     console.log("Data Received:", res);       
    }

  });
}

  getitembudget():void{
    this.getitemdata().subscribe({
      next:(res:any) =>{
         console.log("Data Receiveds",res);
        this.budgetItem=res;
       
      },
      error(err) {
        console.error(err);
      },
    })
  }

  getMonthlyData(): Observable<any[]> {
    const cmn = environment.userapi+"/Tallyreports/company";
    return this.http.get<any[]>(cmn, { withCredentials: true });
    
  }

  getitemdata():Observable<any[]>{
    const url=environment.userapi+"/Tally/Reports/ItemWiseMonthly"
    return this.http.get<any[]>(url,{withCredentials:true})
    }

 

}


