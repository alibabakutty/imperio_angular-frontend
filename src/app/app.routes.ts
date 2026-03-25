import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { NgModule } from '@angular/core';
import { Menu } from './menu/menu';
import { CustomerMasterComponent } from './master/customer_master/customer_master';
import { InventoryMasterComponent } from './master/inventory_master/inventory_master';
import { SubMenu } from './sub-menu/sub_menu';
import { DisplayFetchComponent } from './fetch-master/display-fetch/display_fetch';
import { UpdateFetchComponent } from './fetch-master/update-fetch/update_fetch';
 
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

    {path: '**', redirectTo: 'login' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }