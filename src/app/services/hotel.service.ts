import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  /* private itemRes = new BehaviorSubject('');
  currentReserva = this.itemRes.asObservable(); */
  private btnSearch:boolean=false;

  private politcasHotel = new BehaviorSubject('');
  dataPoliticas;

  //RSTL
  private FechaLimit = new BehaviorSubject('');
  fechasLimite = this.FechaLimit.asObservable();
  // END RSTL

  constructor(private http: HttpClient) {
    this.dataPoliticas = this.politcasHotel.asObservable();
  }

  getDestinoHotel(data) {
    return this.http.get<any>(`${environment.destinations}search/` + data).pipe(map(result => {
      if (result.status) {
        return []
      } else {
        return result;
      }
    }));
  }

  getPoliticasCancelacion(data) {
    return this.http.post<any>(`${environment.apiUrl}politicasCancelacion`, data).pipe(map(result => {
      return result;
    }));
  }

  getHotelRatesDetails(data) {
    return this.http.post<any>(`${environment.apiUrl}getHotelRatesDetails`, data).pipe(map(result => {
      return result;
    }));
  }

  CheckHotelDetailRules(data) {
    return this.http.post<any>(`${environment.apiUrl}CheckHotelDetailRules`, data).pipe(map(result => {
      this.politcasHotel.next(result);
      return result;
    }));
  }

  searchHotel(data) {
    return this.http.post<any>(`${environment.apiUrl}searchHotelsPaged`, data).pipe(map(result => {
      return result;
    }));
  }

  booking(data) {
    return this.http.post<any>(`${environment.apiUrl}booking`, data).pipe(map(result => {
      return result;
    }));
  }

  terminosCondiciones(idOperador) {
    // var idOperador = ConfigService.configFile.idOperador;
    return this.http.get<any>(`${environment.apiUrl}operador/${idOperador}/info_politicas_terminos`).pipe(map(result => {
      return result;
    }));
  }

  getInfoHotel(data) {
    return this.http.get<any>(`${environment.apiUrl}getHotelInfo/` + data.broker + `/` + data.idHotel + '?idOperador=' + data.operador).pipe(map(result => {
      return result;
    }));
  }

  setCurrentReserva(data) {
    localStorage.setItem('item_res', JSON.stringify(data));
    // this.itemRes.next(data);
  }

  //RSTL FUNCTIONS
  prebooking_rstl(data) {
    return this.http.post<any>(`${environment.apiUrl}prebooking`, data).pipe(map(result => {
      return result;
    }));
  }

  setfechaLimitePago(data) {
    this.FechaLimit.next(data);
  }

  getNacionalidades() {
    return this.http.get<any>(`${environment.apiUrl}nacionalidades`).pipe(
      map((result) => {
        return result;
      })
    );
  }

  getNacionalidadHotel(idOperador) {
    return this.http.get<any>(`${environment.apiUrl}agencia/${idOperador}`).pipe(map(result => {
      return result;
    }));
  }


  getTasacambio(moneda) {
    return this.http.get<any>(`${environment.tasaC}exchangerates/`+ moneda).pipe(
      map((result) => {
        return result;
      })
    );
  }

  public getBtnSearch(): boolean {
    return this.btnSearch;
  }
  public setBtnSearch(searching: boolean): void {
    this.btnSearch=searching;
  }

}
