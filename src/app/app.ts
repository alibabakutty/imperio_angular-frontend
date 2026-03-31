import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { LoginService } from './login/loginservice';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
})
export class App implements OnInit {
  username: string | null = null;
  userRole: string | null = null;
  token: string | null = null;
  ImagePath: String = 'assets/Tally Main.jpeg';
  compayname: String = 'Cloud 9 Soft Technologies';
  IsValid: Boolean = true;
  isheadValid: Boolean = true;
  currentYear: number = new Date().getFullYear();

  isDropdownOpen = false;
  focusedIndex = -1;  // -1: none, 0: Direct, 1: Distributor

  // inject login service and router
  constructor(
    private router: Router,
    private loginService: LoginService,
  ) {}

  ngOnInit() {
    /**
     * Instead of checking localStorage on every navigation event,
     * we subscribe to the user$ observable in the LoginService.
     * This ensures the Navbar updates INSTANTLY after login/logout.
     */
    this.loginService.user$.subscribe((user) => {
      this.username = user;
      this.token = localStorage.getItem('authToken');
      this.IsValid = !this.username;
      
      // If a user is logged in, you might want to hide the main landing image
      // if (this.username) {
      //   this.IsValid = false; 
      // } else {
      //   this.IsValid = true;
      // }
    });

    // Listen for Role changes
    this.loginService.role$.subscribe((role) => {
      this.userRole = role;
    });
  }

  // Handle Keyboard Navigation (Arrow Keys + Enter)
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvents(event: KeyboardEvent) {
    if (!this.isDropdownOpen) return;

    // List of keys we care about
    const navigationKeys = ['ArrowDown', 'ArrowUp', 'Enter', 'Escape'];
    
    if (navigationKeys.includes(event.key)) {
      event.preventDefault(); // Stop page scrolling
      
      switch (event.key) {
        case 'ArrowDown':
          this.focusedIndex = (this.focusedIndex + 1) % 2;
          break;
        case 'ArrowUp':
          this.focusedIndex = (this.focusedIndex <= 0) ? 1 : 0;
          break;
        case 'Enter':
          if (this.focusedIndex === 0) this.onLogin('admin');
          if (this.focusedIndex === 1) this.onLogin('user');
          break;
        case 'Escape':
          this.toggleDropdown(false);
          break;
      }
    }
  }

  toggleDropdown(isOpen: boolean) {
    this.isDropdownOpen = isOpen;
    if (!isOpen) {
      this.focusedIndex = -1;
    } else if (this.focusedIndex === -1) {
      // Default to the first item when opened via keyboard/click
      this.focusedIndex = 0;
    }
  }

  onLogin(userType: 'admin' | 'user') {
    this.isDropdownOpen = false;
    this.focusedIndex = -1;
    this.router.navigate(['/login'], { 
      queryParams: { role: userType } 
    });
  }

  logout() {
    this.loginService.logout().subscribe({
      next: () => {
        this.finalizeLogout();
      },
      error: (err) => {
        // Even if the server fails, we clear local data for security
        console.error('Server logout failed. Clearing local session.', err);
        this.finalizeLogout();
      },
    });
  }

  private finalizeLogout() {
    // Clear state in the service so the navbar updates
    this.loginService.clearLocalSession();
    this.token = null;
    this.IsValid = true;
    this.router.navigateByUrl('/login');
  }

  // OnLogin() {
  //   this.router.navigateByUrl('/login');
  // }

  // getToken(): string | null {
  //   const token = document.cookie
  //     .split('; ')
  //     .find((row) => row.startsWith('token='))
  //     ?.split('=')[1];

  //   return token || null;
  // }
}
