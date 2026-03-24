import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '../app';
import { Tally } from '../tally/tally';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  ) {
    this.app.IsValid = false;
  }

  ngOnInit(): void {
    this.menuData = this.tally.getMenuSections();
  }

  routepath(item: any) {
    this.router.navigate(['/submenu'], {
      queryParams: { title: item.label }
    });
  }
}
