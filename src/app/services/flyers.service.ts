import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
  })
  export class FlyersService {

    constructor(private http: HttpClient) { }

    getFlyers (idOperador: string) {
        return this.http.get<any>(`${environment.apiUrl}flyers/${idOperador}`).pipe(map(result => {
            return result;
        }));
    }
  }