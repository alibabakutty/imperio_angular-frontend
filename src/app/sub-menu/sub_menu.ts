import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-sub-menu',
  standalone: true,
  templateUrl: './sub_menu.html',
  styleUrl: './sub_menu.css',
  imports: [CommonModule],
})
export class SubMenu implements OnInit {
  headerTitle: string = '';
  menuItems: any[] = [];
  currentTitle: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      
    this.currentTitle = params['title'] || 'Master';
      console.log('Received:', this.currentTitle); // DEBUG

      this.headerTitle = this.currentTitle.toUpperCase();

      this.loadMenuItems(this.currentTitle);
    });
  }

  loadMenuItems(title: string) {
    const routeMap: any = {
      'Customer Master': 'customer_master',
      'Inventory Master': 'inventory_master',
    };

    const createPath = routeMap[title] || 'customer_master';

    this.menuItems = [
      { label: 'Create', hotkey: 'C', path: createPath },
      { label: 'Display', hotkey: 'D', path: 'display_fetch' },
      { label: 'Update', hotkey: 'U', path: 'update_fetch' },
    ];
  }

  routepath(path: string) {
    if (path === 'menu') {
      this.location.back();
      return;
    }
    
    this.router.navigate([path], {
        queryParams: { title: this.currentTitle }
    });
  }
}
