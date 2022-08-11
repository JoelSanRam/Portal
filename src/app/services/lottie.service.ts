import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LottieService {
  ruta;
  path = ""
  loader$ = new BehaviorSubject<any>({
    show: false,
    text: ''
  });

  constructor() { }

  setLoader(show, text) {
    let loader = {
      show,
      text
    }
    this.loader$.next(loader)
  }

  getLoader() {
    return this.loader$.asObservable();
  }

}