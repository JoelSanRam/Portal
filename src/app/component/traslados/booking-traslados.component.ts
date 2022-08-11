import { Component, OnInit } from '@angular/core';
import { TrasladosService, SharedService, SweetalertService, TraciturService, AuthenticationService } from "@app/services";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PoliticasComponent } from '@app/component/hoteles/politicas/politicas.component';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-booking-traslados',
    templateUrl: './booking-traslados.component.html',
    styleUrls: []
})
export class BookingTrasladosComponent implements OnInit {
    aceptTerms = false;
    datosTraslado;
    aerolineas;
    toStr = JSON.stringify;

    dc: any['nombres'] = {};
    aerolineaLlegada;
    aerolineaSalida;
    horaLlegada;
    horaSalida;
    minutoLlegada;
    minutoSalida;
    numVueloLlegada;
    numVueloSalida;
    user;

    constructor(
        public trasladosService: TrasladosService,
        public sharedService: SharedService,
        private traciturService: TraciturService,
        private modalService: NgbModal,
        private swal: SweetalertService,
        private router: Router,
        private translate: TranslateService,
        private auth: AuthenticationService
    ) {
        this.auth.getLang().subscribe(res => {
            translate.setDefaultLang(res);
        });
        this.sharedService.usuarioObserver.subscribe((user) => {
            this.user = user;
        });
    }

    ngOnInit() {
        this.datosTraslado = JSON.parse(localStorage.getItem('traslado-detalle'));
        this.getAerolineas();
    }

    toggleTerms(event) {
        if (event.target.checked) {
            this.aceptTerms = true;
        } else {
            this.aceptTerms = false;
        }
    }

    TeminosYCondiciones() {
        this.modalService.open(PoliticasComponent, {
            size: 'lg'
        });
    }

    horas() {
        var items: number[] = [];
        for (var i = 1; i <= 23; i++) {
            items.push(i);
        }
        return items;
    }

    minutos() {
        var items: number[] = [];
        for (var i = 1; i <= 59; i++) {
            items.push(i);
        }
        return items;
    }

    getAerolineas() {
        this.trasladosService.getAerolineas().subscribe(r => {
            this.aerolineas = r;
        });
    }

    confirmarBook() {
        var realizandoReservacion;
        this.translate.get('tracitur.realizando-reservacion').subscribe((data: any) => { realizandoReservacion = data; });
        var error;
        this.translate.get('tracitur.error').subscribe((data: any) => { error = data; });
        var errorInesperado;
        this.translate.get('tracitur.error-inesperado').subscribe((data: any) => { errorInesperado = data; });
        var datosBook = this.datosTraslado;
        datosBook.datoscontacto = this.dc;
        datosBook.datosvuelo = {}
        if (this.aerolineaLlegada) {
            datosBook.datosvuelo.aerolineaLlegada = JSON.parse(this.aerolineaLlegada);
            datosBook.datosvuelo.horaLlegada = this.horaLlegada;
            datosBook.datosvuelo.minutoLlegada = this.minutoLlegada;
            datosBook.datosvuelo.numVueloLlegada = this.numVueloLlegada;
        }
        if (this.aerolineaSalida) {
            datosBook.datosvuelo.aerolineaSalida = JSON.parse(this.aerolineaSalida);
            datosBook.datosvuelo.horaSalida = this.horaSalida;
            datosBook.datosvuelo.minutoSalida = this.minutoSalida;
            datosBook.datosvuelo.numVueloSalida = this.numVueloSalida;
        }

        datosBook.total.gt_neto = parseInt(this.datosTraslado.total.neto);
        datosBook.total.gt_publico = parseInt(this.datosTraslado.total.publico);
        datosBook.total.op_total_neto = 0;
        datosBook.total.op_total_publico = 0;

        var pagado = 'success';
        datosBook.statuspago = pagado;

        this.swal.progress(realizandoReservacion);
        this.traciturService.doReservaService(datosBook).subscribe((r) => {
            if (typeof r.status === 'undefined') {
                this.swal.error(error, errorInesperado);
            } else {
                this.swal.closeSwal();
                switch (r.status) {
                    case 'success':
                        this.swal.success(r.title, r.msg);
                        localStorage.removeItem('service_book');
                        localStorage.removeItem('params_circuitos');
                        localStorage.removeItem('params_tours');
                        this.router.navigate(['/reservaciones']);
                        break;
                    case 'warning':
                        this.swal.warning(r.title, r.msg);
                        break;
                    case 'error':
                        this.swal.error(r.title, r.msg);
                        break;
                    default:
                        this.swal.info(r.title, r.msg);
                        break;
                }
            }
        });
    }

}