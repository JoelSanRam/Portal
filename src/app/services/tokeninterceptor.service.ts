import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthenticationService } from "./authentication.service";

@Injectable({
  providedIn: 'root'
})
export class TokeninterceptorService implements HttpInterceptor {
  token;
  lang;

  constructor(
    public auth: AuthenticationService,
  ) {
    this.auth.getLang().subscribe(res=>{
      this.lang = res;
    });
  }
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.currentToken;

    if (!token) {
      return next.handle(req);
    }

    const cloneReq = req.clone({
      headers: req.headers.set('Token', `Bearer ${token}`).set('Lang', ` ${this.lang}`)
    });
    return next.handle(cloneReq);
  }
}
