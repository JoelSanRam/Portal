import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrasladosService {
  private destinosSubject;
  private destinos;
  constructor(private http: HttpClient) { 
    this.destinosSubject = new BehaviorSubject<any>("");
    this.destinos = this.destinosSubject.asObservable();
  }

  getDestinosTraslado(){
    return this.http.get<any>(`${environment.apiUrl}busquedaDestinos/tra`).pipe(map(result => {
      this.destinosSubject.next(result);
      return result;
    }));
  }

  getZones(idDestino){
    return this.http.get<any>(`${environment.apiUrl}traslado/zonas/`+idDestino).pipe(map(result => {
      return result;
    }));
  }

  getAerolineas(){
    return this.http.get<any>(`${environment.apiUrl}aerolineas`).pipe(map(result => {
      return result;
    }));
  }

  getTrasladosAvailables(data){
    return this.http.post<any>(`${environment.apiUrl}availability/traslados`, data).pipe(map(result => {
      return result;
    }));
  }

  getDestinos(){
    return this.destinos;
  }
}
