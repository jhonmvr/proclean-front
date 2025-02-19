import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = `${environment.apiUrl}/auth/login`; // Asegúrate de definir apiUrl en environment.ts

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    console.log("Intentando login con:", username, password);

    // Crear los query params
    const params = new HttpParams()
      .set('username', username)
      .set('password', password);

    // Configurar headers
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // Hacer la petición con query params en la URL
    return this.http.post<any>(`${this.apiUrl}?${params.toString()}`, null, { headers });
  }

  logout(): void {
    localStorage.removeItem('token'); 
  }

  saveToken(token: string): void {
    console.log("Guardando token:", token);
    localStorage.setItem('token', token); 
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken(); 
  }
}
