import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/functions';
import 'firebase/auth';
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private currienciesSubject: BehaviorSubject<any>;
  public currencies: Observable<any>;
  constructor(
  ) {
    this.currienciesSubject = new BehaviorSubject<any>({});
    this.currencies = this.currienciesSubject.asObservable();
    this.setCurrency();
  }

  loginFirebase() {
    firebase.auth().signInAnonymously().then(() => {
			console.info('signed in with firebase')
		}).catch((error) => {
			console.error('error at sign in with firebase', error)
		});
  }

  public setCurrency(idCurrency?) {
    if (idCurrency == undefined) {
      idCurrency = 'MXN';
    }
    let currencies = firebase.database().ref().child("CURRENCIES").child(idCurrency);
    let vm = this;
    currencies.on('value', function (snapshot) {
      if (snapshot.val()) {
        let values = snapshot.val();
        vm.set(values);
      }
    });
  }
  set(currencies) {
    this.currienciesSubject.next(currencies);
  }
}