import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Usuario } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
	usuario: Usuario;
	constructor(private http: HttpClient) { }
	setUser(user) {
		this.usuario = user;
	}
	getDataUser() {
		return this.usuario;
	}
	getUser(id: any) {
		return this.http.get<any>(`${environment.apiUrl}user/${id}`).pipe(map(response => {
			this.setUser(response);
			return this.getDataUser();
		}));
	}
	
	savePerfil(data) {
		return this.http.post<any>(`${environment.apiUrl}editperfil`, data).pipe(map(response => {
			return response;
		}));
	}

	changePass(data) {
		return this.http.post<any>(`${environment.apiUrl}cambiarpass`, data).pipe(map(response => {
			return response;
		}));
	}
	
	changeImg(data) {
		return this.http.post<any>(`${environment.apiUrl}fotoperfil`, data).pipe(map(response => {
			return response;
		}));
	}
}
