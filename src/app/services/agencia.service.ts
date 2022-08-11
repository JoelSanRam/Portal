import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Agencia } from '../models';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AgenciaService {
  lang;
  constructor(
    public auth: AuthenticationService,
    private http: HttpClient
    ) {
    this.auth.getLang().subscribe(res=>{
      this.lang = res;
    });
   }

  getNacionalidad() {
    return this.http.get<any>(`${environment.apiUrl}nacionalidades`).pipe(map(result => {
      return result;
    }));
  }

  getNacionalidadAgencia(idOperador) {
    return this.http.get<any>(`${environment.apiUrl}nationalities?idOperador=${idOperador}`).pipe(map(result => {
      return result;
    }));
  }

  getPais(source) {
    return this.http.get<any>(`${environment.apiUrl}locations/paises`).pipe(map(result => {
      return result;
    }));
  }

  getEstado(codePais) {
    return this.http.get<any>(`${environment.apiUrl}locations/estados/`+codePais).pipe(map(result => {
      return result;
    }));
  }

  getCiudad(codeEstado) {
    return this.http.get<any>(`${environment.apiUrl}locations/ciudades/`+codeEstado).pipe(map(result => {
      return result;
    }));
  }

  createAgencia(data) {
    const headers = { 'Lang': this.lang };
    return this.http.post<any>(`${environment.apiUrl}registro`, data,{ headers }).pipe(map(response => {
        return response;
    }));
  }

  getAgencia(idAgencia: any) {
    return this.http.get<any>(`${environment.apiUrl}agencia/${idAgencia}`).pipe(map(response => {
        return response;
    }));
  }

  updateAgencia(idAgencia: number, data) {
    return this.http.put<any>(`${environment.apiUrl}agencia/${idAgencia}`, data).pipe(map(response => {
      return response;
    }));
  }

  changeLogoDocs(data) {
    return this.http.post<any>(`${environment.apiUrl}agencia/logodocs`, data).pipe(map(response => {
      return response;
    }));
  }
  changePieFlyer(data) {
    return this.http.post<any>(`${environment.apiUrl}agencia/logopie`, data).pipe(map(response => {
      return response;
    }));
  }
  changeLogoHeader(data) {
    return this.http.post<any>(`${environment.apiUrl}agencia/logobanner`, data).pipe(map(response => {
      return response;
    }));
  }

  getUsuarios(idAgencia: number) {
    return this.http.get<any>(`${environment.apiUrl}agencia/${idAgencia}/usuarios/`).pipe(map(response => {
      return response;
    }));
  }

  delUsuario(idAgencia: number, idUsuario: number) {
    return this.http.delete<any>(`${environment.apiUrl}agencia/${idAgencia}/usuario/${idUsuario}`).pipe(map(response => {
      return response;
    }));
  }

  editUsuario(idAgencia: number, idUsuario: number, data) {
    return this.http.put<any>(`${environment.apiUrl}agencia/${idAgencia}/usuario/${idUsuario}`, data).pipe(map(response => {
      return response;
    }));
  }

  createUsuario(idAgencia: number, data) {
    return this.http.post<any>(`${environment.apiUrl}agencia/${idAgencia}/usuario`, data).pipe(map(response => {
      return response;
    }));
  }

  savePermisos(idUsuario: number, data) {
    return this.http.put<any>(`${environment.apiUrl}agencia/usuario/${idUsuario}/permisos`, data).pipe(map(response => {
      return response;
    }));
  }

  getToken(data) {
    return this.http.post<any>(`${environment.apiUrl}agencia/token?typeWeb=HTML`, data).pipe(map(response => {
      return response;
    }));
  }
  updateCoords (data,id) {
    return this.http.patch<any>(`${environment.apiUrl}agencia/${id}/map`, data).pipe(map(result => {
      return result;
    }));
  }
}
