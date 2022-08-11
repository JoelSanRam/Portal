import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Agencia } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  constructor(private http: HttpClient) { }

  getDatosH(source) {
    return this.http.get<any>(`${environment.apiUrl}consultacomisiones/`+source).pipe(map(result => {
      return result;
    }));
  }

  generateLink(r) {
    return this.http.post<any>(`${environment.apiUrl}pagosReserva`, r).pipe(map(response => {
        return response;
    }));
  }

  envioCorreo(dato) {
    return this.http.post<any>(`${environment.apiUrl}envioHappi`, dato).pipe(map(response => {
        return response;
    }));
  }

  /* createAgencia(data) {
    return this.http.post<any>(`${environment.apiUrl}registro`, data).pipe(map(response => {
        return response;
    }));
  }

  updateAgencia(idAgencia: number, data) {
    return this.http.put<any>(`${environment.apiUrl}agencia/${idAgencia}`, data).pipe(map(response => {
      return response;
    }));
  }

  delUsuario(idAgencia: number, idUsuario: number) {
    return this.http.delete<any>(`${environment.apiUrl}agencia/${idAgencia}/usuario/${idUsuario}`).pipe(map(response => {
      return response;
    }));
  }
  updateCoords (data,id) {
    return this.http.patch<any>(`${environment.apiUrl}agencia/${id}/map`, data).pipe(map(result => {
      return result;
    }));
  } */
}
