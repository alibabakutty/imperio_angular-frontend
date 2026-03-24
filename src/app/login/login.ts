import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { App } from '../app';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from './loginservice';
import { Loginvar } from './loginvar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  // toggle between login and register
  isRegisterMode: boolean = false;
  isLoading: boolean = false;
  successMessage: string = '';
  errmessage: string = '';

  currentRole: string = 'direct'; 

  login: Loginvar = { username: '', password: '', email: '', role: 'distributor' };

  constructor(
    private app: App,
    private router: Router,
    private route: ActivatedRoute,  // needded to read queryparams
    private logService: LoginService,
    private cdr: ChangeDetectorRef,
  ) {
    this.app.IsValid = false;
  }

  ngOnInit(): void {
    // 1. Capture the role from the URL (?role=distributor)
    this.route.queryParams.subscribe(params => {
      this.currentRole = params['role'] || 'direct';
      this.login.role = this.currentRole;
    });

    // 2. Clear inputs
    this.login = { username: '', password: '', email: '', role: this.currentRole };

    // 3. Check if already logged in
    if (localStorage.getItem('authToken')) {
      this.router.navigateByUrl('/menu');
    }
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.errmessage = '';
    this.login = { username: '', password: '', email: '', role: this.currentRole }
  }

  onSubmit() {
    if (this.isRegisterMode) {
      this.onRegister();
    } else {
      this.onlogin();
    }
  }

  onlogin() {
    this.isLoading = true;
    this.errmessage = '';

    // FIX: Create a clean payload for Login (Spring Boot likes just these two)
    const loginPayload = {
      username: this.login.username,
      password: this.login.password
    };

    this.logService.login(loginPayload, this.currentRole).subscribe({
      next: (res: any) => {
        if (res.token) {
          
          this.logService.setSession(res.username, this.currentRole, res.token);

          this.app.IsValid = true;
          this.router.navigateByUrl('/menu');
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errmessage = 'Invalid Credentials. Please try again.';
        console.error("Login Error:", err);
      }
    });
  }

  onRegister() {
  this.isLoading = true;
  this.errmessage = '';
  this.successMessage = ''; // Clear previous messages

  this.logService.register(this.login).subscribe({
    next: (res) => {
      // 1. Instantly switch UI state
      this.isRegisterMode = false; 
      this.isLoading = false;
      
      // 2. Clear sensitive data
      this.login.password = '';
      this.login.email = '';

      // 3. Set the smooth success message
      this.successMessage = "Account created successfully! Please login.";

      // 4. Force Angular to see the changes and update the HTML immediately
        this.cdr.detectChanges();

      // 4. Auto-hide the message after 5 seconds
      setTimeout(() => {
        this.successMessage = '';
        this.cdr.detectChanges();
      }, 5000);
    },
    error: (err) => {
      this.isLoading = false;
      this.successMessage = '';
      this.errmessage = "Registration failed. This username or email is already taken.";
      this.cdr.detectChanges();
      console.error("Register Error:", err);
    }
  });
}
}
