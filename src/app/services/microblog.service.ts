import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MicroblogService {

  constructor(private http: HttpClient) { }

  getPublicaciones(limit) {
    if (limit) {
      return this.http.get<any>(`${environment.apiRest}public/microblogs?limit=1`).pipe(map(result => {
        return result;
      }));
    } else {
      return this.http.get<any>(`${environment.apiRest}public/microblogs?limit>1`).pipe(map(result => {
        return result;
      }));
    }
  }
  
  getPublicacion(idBlog) {
    return this.http.get<any>(`${environment.apiRest}public/microblogs/${idBlog}`).pipe(map(result => {
      return result;
    }));
  }
}
