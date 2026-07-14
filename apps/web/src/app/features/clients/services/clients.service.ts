import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  private http = inject(HttpClient);
  private apiUrl = '/api/clients';

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  update(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  checkTaxId(taxId: string, excludeClientId?: string): Observable<{ exists: boolean; clientName?: string }> {
    let params = new HttpParams().set('taxId', taxId);
    if (excludeClientId) params = params.set('excludeClientId', excludeClientId);
    return this.http.get<{ exists: boolean; clientName?: string }>(`${this.apiUrl}/check-tax-id`, { params });
  }

  checkDomain(domain: string, excludeClientId?: string): Observable<{ exists: boolean; clientName?: string }> {
    let params = new HttpParams().set('domain', domain);
    if (excludeClientId) params = params.set('excludeClientId', excludeClientId);
    return this.http.get<{ exists: boolean; clientName?: string }>(`${this.apiUrl}/check-domain`, { params });
  }
}
export default ClientsService;
