import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { importProvidersFrom, NgModule } from '@angular/core';
import { Menu } from './menu/menu';
import { CompanyMasterComponent } from './master/company_master/company_master';
import { InventoryMasterComponent } from './master/inventory_master/inventory_master';
 
export const routes: Routes = [

    {path:'login',component:Login},
    {path:'menu',component:Menu},
    {path:'company_master', component: CompanyMasterComponent},
    {path:'inventory_master',component: InventoryMasterComponent},
    {path: '**', redirectTo: '' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }