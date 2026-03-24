import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { NgModule } from '@angular/core';
import { Menu } from './menu/menu';
import { CompanyMasterComponent } from './master/company_master/company_master';
import { InventoryMasterComponent } from './master/inventory_master/inventory_master';
import { SubMenu } from './sub-menu/sub_menu';
import { DisplayFetchComponent } from './fetch-master/display-fetch/display_fetch';
import { UpdateFetchComponent } from './fetch-master/update-fetch/update_fetch';
 
export const routes: Routes = [

    {path:'login',component: Login},
    {path:'menu',component: Menu},
    {path: 'submenu', component: SubMenu},
    {path:'company_master', component: CompanyMasterComponent},
    {path:'inventory_master',component: InventoryMasterComponent},
    {path: 'display_fetch', component: DisplayFetchComponent},
    {path: 'update_fetch', component: UpdateFetchComponent},
    {path: '**', redirectTo: 'login' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }