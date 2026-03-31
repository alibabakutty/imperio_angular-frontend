import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { NgModule } from '@angular/core';
import { Menu } from './menu/menu';
import { CustomerMasterComponent } from './master/customer_master/customer_master';
import { InventoryMasterComponent } from './master/inventory_master/inventory_master';
import { SubMenu } from './sub-menu/sub_menu';
import { DisplayFetchComponent } from './fetch-master/display-fetch-master/display_fetch_master';
import { UpdateFetchComponent } from './fetch-master/update-fetch-master/update_fetch_master';
import { SalesOrderComponent } from './transaction/sales_order/sales_order';
import { UpdateFetchSalesOrder } from './fetch-master/update-fetch-sales-order/update_fetch_sales_order';
 
export const routes: Routes = [
    {path:'login',component: Login},
    {path:'menu',component: Menu},
    {path: 'submenu', component: SubMenu},

    {path:'customer_master', component: CustomerMasterComponent},
    {path:'inventory_master',component: InventoryMasterComponent},
    {path: 'display_fetch', component: DisplayFetchComponent},
    {path: 'update_fetch', component: UpdateFetchComponent},
   
    {
      path: 'customer',
      children: [
        { path: 'display/:id', component: CustomerMasterComponent },
        { path: 'update/:id', component: CustomerMasterComponent },
      ]
    },

    {
      path: 'inventory',
      children: [
        { path: 'display/:id', component: InventoryMasterComponent },
        { path: 'update/:id', component: InventoryMasterComponent }
      ]
    },
    { path: 'sales_order_update/number/:orderNumber', component: SalesOrderComponent},
    { path: 'sales_order_create', component: SalesOrderComponent},
    { path: 'daybook', component: UpdateFetchSalesOrder},
  
    { path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: '**', redirectTo: 'login' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }