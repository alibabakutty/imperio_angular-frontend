import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '../app';
import { Tally } from '../tally/tally';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu implements OnInit {
  menuData: any[] = [];
  constructor(
    private router: Router,
    private app: App,
    private tally: Tally,
    private location: Location,
  ) {
    this.app.IsValid = false;
  }

  ngOnInit(): void {
    this.menuData = this.tally.getMenuSections();
  }

  routepath(item: any) {
    // 3. Handle the 'login' string or 'quit' action
    if (item === 'login') {
      this.location.back(); // Goes to the previous page in history
      return;
    }

    if (item.path === 'submenu') {
      this.router.navigate(['/submenu'], {
        queryParams: { title: item.label },
      });
    } else {
      this.router.navigate([`/${item.path}`]);
    }
  }
}
