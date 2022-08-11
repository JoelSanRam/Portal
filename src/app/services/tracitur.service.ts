import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { pipe } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TraciturService {
    constructor(private http: HttpClient) {}

    autocomplete($txt, $ts, $types) {
        let params;
        const ts = $ts !== '' ? 'ts=' + $ts : '';
        const types = $types !== '' ? 'types=' + $types : '';
        if (ts) {
            params = ts + '&' + types;
        } else {
            params = types;
        }
        return this.http
            .get<any>(`${environment.apiUrl}autocomplete/${$txt}?${params}`)
            .pipe(
                map((response) => {
                    return response;
                })
            );
    }

    getServiceDetails(data) {
        return this.http.get<any>(`${environment.apiUrl}page/${data}`).pipe(
            map((response) => {
                return response;
            })
        );
    }

    getServiceGallery(data) {
        return this.http
            .get<any>(`${environment.apiUrl}page/${data}/gallery`)
            .pipe(
                map((response) => {
                    return response;
                })
            );
    }

    // TOURS

    searchTours(data) {
        // console
        const pd = data.d || data.D || '';
        const ps = data.s || data.S || '';
        const ocupacion = '&ocupacion=' + data.ocupacion;
        const adultos = '&adultos=' + data.adultos;
        const menores = '&menores=' + data.menores;
        const d = pd != '' ? '&d=' + encodeURI(pd) : '';
        const s = ps != '' ? '&s=' + encodeURI(ps) : '';
        const dt = '&dt=' + data.dt;
        const ts = '&ts=' + data.ts;
        const urlParams = d + s + dt + ts + ocupacion + adultos + menores;
        return this.http
            .get<any>(`${environment.apiUrl}availability/tours?${urlParams}`)
            .pipe(
                map((response) => {
                    return response;
                })
            );
    }

    // FILTROS TOURS
    filtersNameTours(data) {
        return this.http
            .post<any>(`${environment.apiUrl}availability/tours/filtros`, data)
            .pipe(
                map((result) => {
                    return result;
                })
            );
    }
    filtersAllTours(data) {
        return this.http
            .post<any>(
                `${environment.apiUrl}availability/tours/filtrosTodos`,
                data
            )
            .pipe(
                map((result) => {
                    return result;
                })
            );
    }
    // ! TOURS

    // CIRCUITOS
    searchCircuitos(data) {
        const pd = data.d || data.D || '';
        const ps = data.s || data.S || '';
        const ts = '&ts=' + data.ts;
        const d = pd != '' ? '&d=' + encodeURI(pd) : '';
        const s = ps != '' ? '&s=' + encodeURI(ps) : '';
        const dt = '&dt=' + data.dt;
        const nhabs = '&nhabs=' + data.nhabs; // NUMERO DE HABITACIONES
        const habs = '&habs=' + JSON.stringify(data.habs); // ROOMING
        const matchs = '&matchs=' + data.matchs;
        const urlParams = ts + d + s + dt + nhabs + habs + matchs;
        return this.http
            .get<any>(
                `${environment.apiUrl}availability/circuitos?${urlParams}`
            )
            .pipe(
                map((response) => {
                    return response;
                })
            );
    }

    // CHECK AVAILABILITY SPTOUR

    checkAvail(data) {
        return this.http
            .post<any>(`${environment.apiUrl}checkAvail`, data)
            .pipe(
                map((response) => {
                    return response;
                })
            );
    }

    prebooking(data) {
        return this.http
            .post<any>(`${environment.apiUrl}prebooking/circuito`, data)
            .pipe(
                map((response) => {
                    return response;
                })
            );
    }
    // ! CIRCUITOS

    getAeropuertos() {
        return this.http.get<any>(`${environment.apiUrl}aerolineas`).pipe(
            map((response) => {
                return response;
            })
        );
    }

    getSuplementos(typeService, idDestino) {
        return this.http
            .get<any>(
                `${environment.apiUrl}suplementos?ids=${typeService}&dest=${idDestino}`
            )
            .pipe(
                map((result) => {
                    return result;
                })
            );
    }

    doReservaService(data) {
        return this.http
            .post<any>(`${environment.apiUrl}reservacion/servicios`, data)
            .pipe(
                map((result) => {
                    return result;
                })
            );
    }
}
