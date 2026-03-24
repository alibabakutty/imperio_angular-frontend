import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { Loginvar } from './loginvar';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  // Define standard headers
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  // BehaviorSubject initialized with the current value in localStorage
  private userSubject = new BehaviorSubject<string | null>(localStorage.getItem('username'));
  private roleSubject = new BehaviorSubject<string | null>(localStorage.getItem('userRole'));
  // Expose as Observable for components (like your Navbar) to subscribe to
  user$ = this.userSubject.asObservable();
  role$ = this.roleSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ✅ Centralized method to update both Storage and UI State
  setSession(username: string, role: string, token: string) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', username);
    localStorage.setItem('userRole', role);
    
    this.userSubject.next(username);
    this.roleSubject.next(role);
  }

    login(credentials: any, role: string) {
    return this.http.post<any>(`${environment.userapi}/login`, credentials).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('authToken', res.token);
          localStorage.setItem('username', res.username);
          localStorage.setItem('userRole', role); // Save the role passed from UI
          
          this.userSubject.next(res.username);
          this.roleSubject.next(role);
        }
      })
    );
  }

  // Register
  register(data: Loginvar): Observable<any> {
    const url = `${environment.userapi}/register`;
    return this.http
      .post(url, data, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  
  // Logout
  logout(): Observable<any> {
    const url = `${environment.userapi}/logout`;
    
    return this.http.post(url, {}, { headers: this.headers, withCredentials: true })
      .pipe(
        tap(() => this.clearLocalSession()), // Always clear locally on success
        catchError((err) => {
          this.clearLocalSession(); // Clear locally even if server fails
          return this.handleError(err);
        })
      );
  }

  public clearLocalSession() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    this.userSubject.next(null); // This instantly updates the Navbar to show 'Login'
    localStorage.clear();
    this.userSubject.next(null);
    this.roleSubject.next(null);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
