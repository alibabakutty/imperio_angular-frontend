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
  // Expose as Observable for components (like your Navbar) to subscribe to
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: any, role: string): Observable<any> {
    const url = `${environment.userapi}/login`;
    
    // We send the credentials and the role to the backend
    return this.http.post<any>(url, { ...credentials, role }, { 
      headers: this.headers,
      withCredentials: true 
    }).pipe(
      tap(res => {
        // Success: Update localStorage and notify the app
        localStorage.setItem('authToken', res.token);
        localStorage.setItem('username', res.username);
        this.userSubject.next(res.username); 
      }),
      catchError(this.handleError)
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
