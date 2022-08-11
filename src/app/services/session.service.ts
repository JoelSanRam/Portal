import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Usuario } from '../models';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
	private sessionSubject:Subject<string> = new BehaviorSubject<string>('');
	constructor(private http: HttpClient) { 
		
	}

	getSession() {
		return this.sessionSubject.asObservable();
	}

	setSession(user) {
        this.sessionSubject.next(user);
	}
	
	session() {
		return this.http.get<any>(`${environment.apiUrl}permisos`).pipe(map(response => {
			let responsed= JSON.stringify(response.data);
			this.setSession(responsed);
			//return response;
		}));
	}
}
