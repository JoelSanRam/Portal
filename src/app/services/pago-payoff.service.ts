import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PagoPayoffService {

  constructor(private http: HttpClient) { }

  getKey(r) {
    return this.http.post<any>(`${environment.apiUrl}obtenerKey`, r).pipe(map(response => {
        return response;
    }));
  }

  crearLiga(r) {
    return this.http.post<any>(`${environment.apiUrl}crearLiga`, r).pipe(map(response => {
        return response;
    }));
  }
}
