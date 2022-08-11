import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ReservacionesService {
    constructor(private http: HttpClient) {}

    getReservaciones(data) {
        return this.http.get<any>(`${environment.apiUrl}reservas?` + data).pipe(
            map((result) => {
                return result;
            })
        );
    }

    getDetReserva(id: number) {
        return this.http.get<any>(`${environment.apiUrl}reserva/${id}`).pipe(
            map((result) => {
                return result;
            })
        );
    }

    // MODAL PAGO
    consultarSaldo(id: number) {
        return this.http
            .post<any>(`${environment.apiUrl}consultaSaldo`, id)
            .pipe(
                map((result) => {
                    return result;
                })
            );
    }
    consultarDepositos(id: number) {
        return this.http
            .post<any>(`${environment.apiUrl}consultaDepositos`, id)
            .pipe(
                map((result) => {
                    return result;
                })
            );
    }

    downloadCVS(data) {
        return this.http.get<any>(`${environment.apiUrl}reservas?` + data).pipe(
            map((result) => {
                return result;
            })
        );
    }

    getDataCancelacion(data) {
        return this.http.get<any>(`${environment.apiUrl}reservas/` + data + '/penalidad').pipe(
            map((result) => {
                return result;
            })
        );
    }

    getListMotivos() {
        return this.http.get<any>(`${environment.apiUrl}motivos/cancelacion`).pipe(
            map((result) => {
                return result;
            })
        );
    }

    patchCancelacion(id, data){
        return this.http.patch<any>(`${environment.apiUrl}reservas/${id}/cancel`, data).pipe(
            map((result) => {
                return result;
            })
        );
    }
}
