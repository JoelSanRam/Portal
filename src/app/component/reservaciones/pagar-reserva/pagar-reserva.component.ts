import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SweetalertService } from '../../../services/sweetalert.service';
import { ReservacionesService } from '../../../services';
import { NgxSpinnerService } from "ngx-spinner";
import { PagoComponent } from './pago/pago.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'app-pagar-reserva',
    templateUrl: './pagar-reserva.component.html',
    styleUrls: [],
})
export class PagarReservaComponent implements OnInit {
    @Input() reserva;
    id;
    precioNe;
    precioPu;
    datosRes;
    detReserva;
    saldo;
    maxpag;
    depositos = [];

    constructor(
        private swal: SweetalertService,
        private reservacionesService: ReservacionesService,
        private spinnerService: NgxSpinnerService,
        private modalService: NgbModal,
        public activeModal: NgbActiveModal
    ) {}

    ngOnInit() {
        this.spinnerService.show();
        this.id = this.reserva.datosreserva.idReserva;
        this.datosRes = this.reserva.datosreserva;
        this.detReserva = this.reserva.detalles;
        const currency = this.datosRes.reserva_currency;
        if (currency == 'USD') {
            const tazaCambio = this.datosRes.reserva_currency_tc;
            const dolaresN = this.datosRes.importe_agen;
            const dolaresP = this.datosRes.importe_publico;
            this.precioNe = dolaresN * tazaCambio;
            this.precioPu = dolaresP * tazaCambio;
            this.precioNe = Math.ceil(this.precioNe);
            this.precioPu = Math.ceil(this.precioPu);
        } else {
            this.precioNe = this.datosRes.importe_agen;
            this.precioPu = this.datosRes.importe_publico;
        }
        this.consultarSaldo(this.id);
        this.consultarDepositos(this.id);
    }

    consultarSaldo(id) {
        this.reservacionesService.consultarSaldo(id).subscribe((r) => {
            if (r == false) {
                this.saldo = this.precioNe;
                this.maxpag = this.precioPu;
            } else {
                this.saldo = r.saldo;
                this.maxpag = r.saldo;
            }
        });
    }

    consultarDepositos(id) {
        this.reservacionesService.consultarDepositos(id).subscribe((r) => {
            this.depositos = r;
        });
        this.spinnerService.hide();
    }

    showDetalle(detalles) {
    }

    modalPagar(tipo, r, max, datosres) {
        let data = {
            montoPag: r,
            tipop: tipo,
            maximo: max,
            datosr: datosres
          }
        const modalRef = this.modalService.open(PagoComponent, {backdrop:'static', size:'lg'});
        modalRef.componentInstance.datos = data;
    }
}
