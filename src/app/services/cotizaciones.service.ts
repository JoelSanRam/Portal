import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: "root",
})
export class CotizacionesService {
  private itemCotizacion;
  private cotizacionesNoVistasSubject;
  public currentCotizacion;
  public cotizacionesNoVistas;
  constructor(private http: HttpClient) {
    this.itemCotizacion = new BehaviorSubject("");
    this.currentCotizacion = this.itemCotizacion.asObservable();
    this.cotizacionesNoVistasSubject = new BehaviorSubject("");
    this.cotizacionesNoVistas = this.cotizacionesNoVistasSubject.asObservable();
  }

  getCotizaciones() {
    return this.http.get<any>(`${environment.apiUrl}cotizacion/item`).pipe(
      map((result) => {
        return result;
      })
    );
  }

  getCotizacionesPaginadas(page, limit) {
    return this.http.get<any>(`${environment.apiUrl}cotizacion/item?page=${page}&limit=${limit}`).pipe(
      map((result) => {
        return result;
      })
    );
  }

  saveCotizaciones(data) {
    return this.http
      .post<any>(`${environment.apiUrl}cotizacion/item`, data)
      .pipe(
        map((result) => {
          return result;
        })
      );
  }

  getHistorialPaginado(page, limit) {             
    return this.http.get<any>(`${environment.apiUrl}cotizacion/historial?page=${page}&limit=${limit}`).pipe(
      map((result) => {
        return result;
      })
    );
  }

  getHistorial() {
    return this.http.get<any>(`${environment.apiUrl}cotizacion/historial`).pipe(
      map((result) => {
        return result;
      })
    );
  }

  getPDF(idCotizacion) {
    return this.http
      .get<any>(`${environment.apiUrl}cotizacion/historial/${idCotizacion}`)
      .pipe(
        map((result) => {
          return result;
        })
      );
  }

  delCotizacion(data) {
    return this.http
      .delete<any>(`${environment.apiUrl}cotizacion/item?cotizaciones=${data}`)
      .pipe(
        map((result) => {
          return result;
        })
      );
  }

  delHistorial(data) {
    return this.http
      .delete<any>(`${environment.apiUrl}cotizacion/${data}`)
      .pipe(
        map((result) => {
          return result;
        })
      );
  }

  setCotizacionesNoVistas(data) {
    this.cotizacionesNoVistasSubject.next(data);
  }
  getCotizacionesNoVistas() {
    return this.cotizacionesNoVistas;
  }

  visto() {
    return this.http
      .patch<any>(`${environment.apiUrl}cotizacion/item`, "")
      .pipe(
        map((result) => {
          return result;
        })
      );
  }

  setCurrentCotizacion(data) {
    this.itemCotizacion.next(data);
  }

  getHotelInfo(data) {
    return this.http.get<any>(`${environment.apiUrl}getHotelInfo/`+data.broker+`/`+data.idHotel+'?idOperador='+data.operador).pipe(map(result => {
      return result;
    }));
  }

  saveCotizacion(data) {
    return this.http.post<any>(`${environment.apiUrl}cotizacion`, data).pipe(
      map((result) => {
        return result;
      })
    );
  }
}
