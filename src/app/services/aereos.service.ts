import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable, Observer, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import 'firebase/database';


@Injectable({
	providedIn: "root",
})
export class AereosService {
	private flightsSearchParams$ = new BehaviorSubject<any>("");
	private booking$ = new BehaviorSubject<any>("");
	private cotizarConfirm;

	private selectedfilters$ = new BehaviorSubject<any>(
		{
			ordenar: '',
			aerolinea: [],
			escalas: [],
			horarios: {},
			duracion: [],
			precio: []
		}
	);

	constructor(private http: HttpClient) {}

	autocompleAirport(nombre) {
		return this.http
			.get<any>(
				`${environment.apiRest}airports/autocomplete?search=${nombre}`
			)
			.pipe(
				map((result) => {
					if (result.status) {
						return [];
					} else {
						return result;
					}
				})
			);
	}

	setFlightsSearchParams(params) {
		this.flightsSearchParams$.next(params);
	}

	getFlightsSearchParams() {
		return this.flightsSearchParams$.asObservable();
	}

	disponibilidadAereos(data) {
		return this.http
			.post<any>(`${environment.aereos}Disponibilidad`, data)
			.pipe(
				map((result) => {
					return result;
				})
			);
	}

	setCurrentFlight(data) {
		localStorage.setItem("item_flight", JSON.stringify(data));
	}

	getFamilyFare(data) {
		return this.http.post<any>(`${environment.aereos}familias_tarifarias`, data).pipe(map(result => {
			return result;
		}))

	}

	checkFlight(data) {
		return this.http.post<any>(`${environment.aereos}check`, data).pipe(map(result => {
			return result;
		}))
	};

	sendPaxData(data) {
		const headers = { 'origen-plataforma': 'AGE' };
		return this.http.post<any>(`${environment.aereos}pax_data`, data, { headers }).pipe(map(result => {
			return result;
		}))
	};

	aereosPay(data){
		return this.http.post<any>(`${environment.happi}token`, data).pipe(map(result => {
			return result;
		}))
	}

	phones(){
		return this.http.get<any>(`${environment.apiRest}phones`).pipe(map(response => {
			return response;
		}));
	}

	titulos(){
		return this.http.get<any>(`${environment.apiRest}titulos`).pipe(map(response => {
			return response;
		}));
	}

	documents(){
		return this.http.get<any>(`${environment.apiRest}documents`).pipe(map(response => {
			return response;
		}));
	}

	setPrebooking(uuid: string) {
		firebase.database().ref(`aereos/bookings/${uuid}`).set({
			idBooking: '',
			idPrebooking: '',
			sesion_broker: '',
			status_booking: 'PE',
			status_payment: 'PE',
			status_prebooking: 'PE',
			step: 'prebooking'
		}).catch((error) => {
			console.error('No se guardo en firebase', error)
		});
	}

	watchFirebase(uuid: string) {
		return new Observable((observer: Observer<any>) => {
			firebase.database().ref(`aereos/bookings/${uuid}`).on('value', (snapshot) => {
				observer.next(snapshot.val())
			});
		});
	}
	
	updateToPayment(uuid: string) {
		let payData = {
			status_payment: 'PR',
			step: 'payment'
		}
		firebase.database().ref(`aereos/bookings/${uuid}`).update(payData)
		.catch((error) => {
			console.error('No se actualizó en firebase', error)
		});
	}
	
	setBooking(booking: any) {
		this.booking$.next(booking);
	}

	getBooking(){
		return this.booking$.asObservable();
	}

	// Obtener resultados de aereos con filtros
	getFilteredResults(filters) {
		return this.http.post<any>(`${environment.aereos}filtros`, filters).pipe(map(response => {
			return response;
		}));
	}

	setSelectedFilters(filtros){
		this.selectedfilters$.next(filtros);
	}

	getSelectedFilters$():Observable<any>{
		return this.selectedfilters$.asObservable();
	}
	
	getControlBoookingPaginated(page, params){
		if(params == undefined){
			return this.http.get<any>(`${environment.apiRest}public/bookings?pagination[page]=${page}&pagination[per_page]=10`).pipe(map(response => {
				return response.data;
			}));
		}else{
			return this.http.get<any>(`${environment.apiRest}public/bookings?pagination[page]=${page}&pagination[per_page]=10${params}`).pipe(map(response => {
				return response.data;
			}));
		}
		
	}	

	getAirlines(){
		return this.http.get<any>(`${environment.apiRest}airlines`).pipe(map(response => {
			return response;
		}));
	}

	autocompleteAirlines(airline){
		return this.http.get<any>(`${environment.apiRest}airlines/autocomplete?search=${airline}`).pipe(map(response => {
			return response;
		}));
	}

	getStatus(){
		return this.http.get<any>(`${environment.apiRest}status/booking`).pipe(map(response => {
			return response;
		}));
	}

	sendCotizarConfirm(cotizar:any):void{
		this.cotizarConfirm=cotizar;
	   }
   
	 getCotizarConfirm():any{
	 return this.cotizarConfirm;
	 }
}
