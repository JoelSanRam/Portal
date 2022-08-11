import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IframeService {

  constructor(private http: HttpClient) { }

  getIframeList() {
    return this.http.get<any>(`${environment.apiUrl}iframe`).pipe(map(result => {
      return result;
    }));
  }

  getIframe(id: number) {
    return this.http.get<any>(`${environment.apiUrl}iframe/${id}`).pipe(map(result => {
      return result;
    }));
  }

  saveIframe(data: any) {
    return this.http.post<any>(`${environment.apiUrl}iframe`, data).pipe(map(result => {
      return result;
    }));
  }

  editIframe(data: any) {
    return this.http.put<any>(`${environment.apiUrl}iframe`, data).pipe(map(result => {
      return result;
    }));
  }

  deleteIframe(id: any) {
    return this.http.delete<any>(`${environment.apiUrl}iframe/${id}`).pipe(map(result => {
      return result;
    }));
  }
}
