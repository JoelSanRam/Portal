import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
  })
  export class GruposService {

    constructor(private http: HttpClient) { }

    getHotelesGrupos () {
        return this.http.get<any>(`${environment.apiUrl}grupos/hoteles`).pipe(map(result => {
            return result;
        }));
    }

    getPlanAlimentos () {
        return this.http.get<any>(`${environment.apiUrl}planalimentos`).pipe(map(result => {
            return result;
        }));
    }
    
    getTipos () {
        return this.http.get<any>(`${environment.apiUrl}grupos/tipos`).pipe(map(result => {
            return result;
        }));
    }

    getEventos () {
        return this.http.get<any>(`${environment.apiUrl}grupos/eventos`).pipe(map(result => {
            return result;
        }));
    }

    getServicios () {
        return this.http.get<any>(`${environment.apiUrl}grupos/servicios`).pipe(map(result => {
            return result;
        }));
    }

    sendMail (data) {
        return this.http.post<any>(`${environment.apiUrl}grupos/mail`, data).pipe(map(result => {
            return result;
        }));
    }

    getGruposList () {
        return this.http.get<any>(`${environment.apiUrl}grupos/control`).pipe(map(result => {
            return result;
        }));
    }

    sendMensaje (data) {
        return this.http.post<any>(`${environment.apiUrl}grupos/mensajes`, data).pipe(map(result => {
            return result;
        }));
    }

    getMensajes (folio: string) {
        return this.http.get<any>(`${environment.apiUrl}grupos/mensajes?folio=${folio}`,).pipe(map(result => {
            return result;
        }));
    }
    
  }