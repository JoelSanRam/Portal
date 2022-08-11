import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { map, tap, mapTo, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { User } from '@app/models';
import { ConfigService } from './config.service';
import { FirebaseService } from './firebase/firebase.service';

@Injectable({
  providedIn: 'root',
})

export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  public token = '';
  private lang$ = new BehaviorSubject<any>("");
  private typeLoader: BehaviorSubject<any>;

  public path = new BehaviorSubject<any>(undefined);

  constructor(private http: HttpClient, private fb: FirebaseService) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('currentUser'))
    );
    // this.token = null;

    if (this.currentUserSubject.value !== null) {
      this.token = this.currentUserSubject.value.token;
    }
    this.currentUser = this.currentUserSubject.asObservable();
  }
  public get currentToken() {
    return this.token;
  }
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }
  login(usuario: string, password: string, idOperador: string) {
    return this.http
      .post<any>(`${environment.apiUrl}login`, {
        usuario,
        password,
        idOperador,
      })
      .pipe(
        map((user) => {
          if (user && user.token != null) {
        
            
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('access_token', user.token);
            localStorage.setItem('access_user', user.userData.idUser);
            localStorage.setItem('access_agen', user.userData.idAgencia);
            localStorage.setItem('access_ope', user.userData.idOperador);
            localStorage.setItem('user_data', user);
            this.token = user.token;
            this.currentUserSubject.next(user);
            this.fb.loginFirebase();
          }
          return user;
        })
      );
  }
  logout() {
    this.currentUserSubject.next(null);
  }

  forgotPass(data) {
    let idOperador = ConfigService.configFile.idOperador;
    data.idOperador = idOperador;
    return this.http.post<any>(`${environment.apiUrl}forgot`, data).pipe(
      map((result) => {
        return result;
      })
    );
  }

  setLang(lang:any){
    if(lang=="" || typeof lang == undefined){
      if(!ConfigService.configFile.lang || ConfigService.configFile.lang == '' || typeof ConfigService.configFile.lang == undefined){
        this.lang$.next('es-mx');
      }else{
        this.lang$.next(ConfigService.configFile.lang);
      }
    }else{
      this.lang$.next(lang);
    }
  }

  getLang(){
    return this.lang$.asObservable();
  }


  setTypeLoader(tipo){
    let link = {
      existInConfig: false,
      url: "",
      tipo: ''
    };
    link.tipo = tipo;
    if (link.tipo == 'vuelos') {
      link.existInConfig = false;
      link.url = 'https://tms-img.s3.amazonaws.com/loaders/loader_aereos.json';
      this.path.next(link);
      // console.log("uno", this.path.value);
    } else if (ConfigService.configFile.url_loader || ConfigService.configFile.url_loader != '' || ConfigService.configFile.url_loader != undefined) {
      link.existInConfig = true;
      if(link.existInConfig = true && !ConfigService.configFile.url_loader){
        link.existInConfig = false;
        link.url = '';
      this.path.next(link)
      // console.log("dos", this.path.value);
      }else{
        link.existInConfig = true;
        link.url = ConfigService.configFile.url_loader;
        this.path.next(link)
        // console.log("dos", this.path.value);
      }
    }
  }

  getTypeLoader() {
    return this.path;
  }

  /* getPath() {
    let path = {
      status: false,
      url: 'https://tms-img.s3.amazonaws.com/loaders/loader_aereos.json',
      type: ''
    };

    if (ConfigService.configFile.url_loader) {
      path.status = true;
      path.url = ConfigService.configFile.url_loader;
    }
    return path;
  } */

}
