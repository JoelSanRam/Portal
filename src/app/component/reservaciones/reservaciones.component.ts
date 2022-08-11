import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { ReservacionesService, AuthenticationService, SharedService, ConfigService, SweetalertService, AereosService, SessionService } from "@app/services";
import { DatePipe } from "@angular/common";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReservaDetalleComponent } from './reserva-detalle/reserva-detalle.component';
import { PagarReservaComponent } from './pagar-reserva/pagar-reserva.component';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute } from '@angular/router';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { formatCurrency } from '@angular/common';
import * as moment from 'moment';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { BehaviorSubject, Observable, Observer, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PagarReservaPayoffComponent } from './pagar-reserva-payoff/pagar-reserva-payoff.component';
import { MostarLigaPagoComponent } from './mostar-liga-pago/mostar-liga-pago.component';
import { CancelacionComponent } from './cancelacion/cancelacion.component';
import { LottieService } from '@app/services/lottie.service';
import { AppComponent } from '@app/app.component';
defineLocale('es', esLocale);
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-reservaciones',
    templateUrl: './reservaciones.component.html',
    styleUrls: []
})
export class ReservacionesComponent implements OnInit {
    filtroForm: FormGroup;
    filtroFormAereos: FormGroup;
    today = new Date(Date.now());
    imgruta;
    main;
    uData;
    user;
    // dateChekInOut;
    desde: Date = new Date(Date.now());   //-Check In
    hasta: Date = new Date(); //-Check Out
    bsRangeValue: Date[];
    meses: Array<string>;
    diaDesde: string;
    diaHasta: string;
    mesDesde: string;
    mesHasta: string;
    anioDesde: string;
    anioHasta: string;
    listReservaciones: Array<string> = [];
    listAereos: Array<string> = [];

    status = [];
    linkDownload;
    statusDefault = [];
    dropdownSettings: NgMultiSelectDropDownModule;
    statusSelected = [];
    rutaActiva;
    bsConfig: Partial<BsDatepickerConfig>;
    locale = 'es';
    agencia;

    pramsFiltros;
    paramsFiltrosAereos;
    idOpe;
    currentUser;

    perPage;
    currentPage;
    page;
    params;
    totalPages;
    totalResultados;
    maxSize = 10;

    ahora = Date.now();
    now = new Date(this.ahora);

    destinos;
    iataOrigen: string;
    iataDestino: string;
    iataAirline: string;
    permisoVuelos = 0;
    airlines;
    statusSelect;
    paramasVuelosFiltros;

    permisosPagos;
    permisosPagosAgency;

    permisos = [];
    permisosAgency = [];
    permisosActive = [];
    rutaP = '';
    tabActive;
    serviciosAgencia;
    serviciosAgenciaP = [];
    url_loader;
    permisoUsuarioVuelos;
    permisoAgenciaVuelos;

    anuncios = ConfigService.configFile.anuncios;
    idOperador = ConfigService.configFile.idOperador;
    anuncio1;
    link1;
    constructor(
        private formBuilder: FormBuilder,
        private datePipe: DatePipe,
        private reservacionesService: ReservacionesService,
        private aereosService: AereosService,
        private modalService: NgbModal,
        private authenticationService: AuthenticationService,
        private sharedService: SharedService,
        private spinnerService: NgxSpinnerService,
        private router: Router,
        private localeService: BsLocaleService,
        private swal: SweetalertService,
        private translate: TranslateService,
        private sessionservice: SessionService,
        private lottieService: LottieService,
        private appComponent: AppComponent
    ) {
        this.filtroFormAereos = this.formBuilder.group({
            idAereos: [''],
            titularAereos: [''],
            origenAereos: [''],
            destinoAereos: [''],
            aereolineaAereos: [''],
            fechaAereos: [''],
            desdeAereos: [''],
            hastaAereos: [''],
            statusAereos: [''],
        })
        this.rutaActiva = this.router.url;
        this.sharedService.usuarioObserver.subscribe(x => this.user = x);
        this.main = localStorage.getItem('access_ope');
        this.desde.setDate(this.hasta.getDate() - 15);
        this.meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        this.bsConfig = Object.assign({}, {
            containerClass: 'theme-default',
            showWeekNumbers: false
        });
        this.bsRangeValue = [this.desde, this.hasta];
        this.localeService.use(this.locale);
        this.imgruta = './assets/img/spinners/general.gif?' + this.today;
        this.agencia = localStorage.getItem('access_agen');
        this.authenticationService.currentUser.subscribe(x => {
            this.currentUser = x;
            if (x.userData.idAgencia == 11241) {
                this.permisoVuelos = 1;
            }
        });
        this.idOpe = this.currentUser.userData.idOperador;
        this.sessionservice.getSession().subscribe(response => {
            if (response) {
                let permisosdecode = JSON.parse(response);
                this.permisosPagos = permisosdecode.pagos;
                this.permisoUsuarioVuelos = permisosdecode.vuelos;
            }
            this.sharedService.agenciaObserver.subscribe(agencia => {
                this.serviciosAgencia = agencia.servicios;
                this.permisosPagosAgency = this.serviciosAgencia.pagos;
                this.permisoAgenciaVuelos = this.serviciosAgencia.vuelos;
            });
        });
        this.authenticationService.setTypeLoader('defaul')
        this.authenticationService.getLang().subscribe(res => {
            translate.setDefaultLang(res);
        });
    }

    ngOnInit() {
        this.authenticationService.getTypeLoader().subscribe((res) => {
            if (res != undefined) {
                this.url_loader = res
            }
        })
        // console.log("reservaciones",this.url_loader);
        this.showloader();
        this.filtroFormAereos.patchValue({
            idAereos: '',
            titularAereos: '',
            origenAereos: '',
            destinoAereos: '',
            aereolineaAereos: '',
            fechaAereos: '',
            desdeAereos: this.now,
            hastaAereos: this.now,
            statusAereos: '',
        })
        // this.spinnerService.show();
        // this.diaDesde = this.desde.toString();
        var PA;
        var CO;
        var PE;
        var CA;
        var RE;
        this.translate.get('reservaciones.PA').subscribe((data: any) => { PA = data; });
        this.translate.get('reservaciones.CO').subscribe((data: any) => { CO = data; });
        this.translate.get('reservaciones.PE').subscribe((data: any) => { PE = data; });
        this.translate.get('reservaciones.CA').subscribe((data: any) => { CA = data; });
        this.translate.get('reservaciones.RE').subscribe((data: any) => { RE = data; });
        // this.translate.get('reservaciones.error-login').subscribe((data:any)=> { return data;});
        this.status = [
            { status: 'PA', name: 'Pagada' },
            { status: 'CO', name: 'Confirmada' },
            { status: 'PE', name: 'Pendiente' },
            { status: 'CA', name: 'Cancelada' },
            { status: 'RE', name: 'Rechazada' }
        ];
        this.statusDefault = [
            { status: 'PA', name: 'Pagada' },
            { status: 'CO', name: 'Confirmada' },
            { status: 'PE', name: 'Pendiente' },
        ];
        this.dropdownSettings = {
            singleSelection: false,
            idField: 'status',
            textField: 'name',
            selectAllText: 'Seleccionar todos',
            unSelectAllText: 'Deseleccionar todos',
            itemsShowLimit: 1,
            allowSearchFilter: false
        };

        this.filtroForm = this.formBuilder.group({
            idReserva: [''],
            search: [''],
            tipofecha: [''],
            range: [''],
            status: [this.statusDefault]
        });
        this.filtroForm.patchValue({
            tipofecha: 'FRV',
            range: this.bsRangeValue,
            status: this.statusDefault
        });
        this.uData = this.main;
        this.filtrar();
        this.filterRequestAereos(1, null)
        this.getStatus();
        
        //CARGA DE BANNERS POR OPERADOR
        var operador;
        if(
            this.idOperador == "AZAMID" && this.idOpe == "AZAMID" ||
            this.idOperador == "AZAMID" && this.idOpe == "AZAMTY" ||
            this.idOperador == "AZAMID" && this.idOpe == "AZAMX"
        ){
            operador = "AZAMID";
            this.link1 = ConfigService.configFile.anuncios[operador].principal;
            this.anuncio1 = './assets/img/anuncio1_'+operador+'.jpg';
        }else if( 
            (
                this.idOperador == "AZABR" && this.idOpe == "AZABR"
            ) || this.idOpe == "AZABR" || this.idOpe == "AZALTM"  || this.idOpe == "AZACR" || this.idOpe == "AZAPTY"
        ){
            operador = this.idOpe;
            this.link1 = ConfigService.configFile.anuncios[operador].principal;
            this.anuncio1 = './assets/img/anuncio1_'+operador+'.jpg';
        }else{
            this.link1 = ConfigService.configFile.anuncios.principal;
            this.anuncio1 = './assets/img/anuncio1.jpg';
        }
    }

    cancelacionesList = []

    showloader() {
        if (this.url_loader.existInConfig == false) {
            this.spinnerService.show();
        } else {
            this.lottieService.setLoader(true, '');
            // console.log(this.url_loader);
        }
    }

    hideLoader() {

        if (this.url_loader.existInConfig == true) {
            this.lottieService.setLoader(false, '');
        } else {
            this.spinnerService.hide();
        }
    }

    get f() { return this.filtroForm.controls; }

    changeDate(value) {
        this.filtroForm.value.range = value;
        let desde = this.filtroForm.value.range[0];
        this.diaDesde = desde.getDate();
        this.mesDesde = this.meses[desde.getMonth()];
        this.anioDesde = desde.getFullYear().toString();
        let hasta = this.filtroForm.value.range[1];
        this.diaHasta = hasta.getDate();
        this.mesHasta = this.meses[hasta.getMonth()];
        this.anioHasta = hasta.getFullYear().toString();
    }

    onItemSelect(item: any) {
        this.statusSelected.push(item);
    }
    onSelectAll(items: any) {
        this.statusSelected = [
            { status: 'PA', name: 'Pagada' },
            { status: 'CO', name: 'Confirmada' },
            { status: 'PE', name: 'Pendiente' },
            { status: 'CA', name: 'Cancelada' },
            { status: 'RE', name: 'Rechazada' }
        ];
    }

    onItemDeSelect(item: any) {
        for (var i = 0; i < this.statusSelected.length; i++) {
            if (this.statusSelected[i].status === item.status) {
                this.statusSelected.splice(i, 1);
            }
        }
    }

    onDeSelectAll(items: any) {
        this.statusSelected = [];
    }

    filtrar() {
        let statusSelected = [];
        this.statusSelected.forEach(s => {
            statusSelected.push(s.status);
        });

        let desde = this.datePipe.transform(this.filtroForm.value.range[0], 'yyyy-MM-dd');
        let hasta = this.datePipe.transform(this.filtroForm.value.range[1], 'yyyy-MM-dd');
        var download = '&download=0';
        var idReserva = (this.filtroForm.value.idReserva != '') ? 'idReserva=' + this.filtroForm.value.idReserva : '';
        var tipofecha = (this.filtroForm.value.tipofecha != '') ? '&tipofecha=' + this.filtroForm.value.tipofecha + '&desde=' + desde + '&hasta=' + hasta : '';
        var status = (statusSelected.length > 0) ? '&status=' + statusSelected : '';
        let params = idReserva + tipofecha + status + download;
       
        this.showloader();
        this.filterRequest(params);
    }

    filterRequest(params: any) {
        this.pramsFiltros = params;
        this.reservacionesService.getReservaciones(params).subscribe(response => {
            this.listReservaciones = response;
            this.hideLoader();
        });
    }

    preFilters(option) {
        let statusSelected = [];
        let now = new Date(Date.now());
        let desde = new Date();
        let hasta = new Date();
        let tipofecha = '';
        let params;
        let desdeTrans;
        let hastaTrans;

        let getReservasconRango = 1;
        // this.spinnerService.show();
        this.showloader()
        switch (option) {
            case 'ultimas100':
                getReservasconRango = 0;
                params = 'last=100';
                break;
            case 'gastos':
                statusSelected = ['PA', 'CO', 'PE'];
                desde = now;
                hasta.setDate(now.getDate() + 15);
                tipofecha = 'FLA'
                break;
            case 'entradas':
                statusSelected = ['PA', 'CO', 'PE'];
                desde = now;
                hasta.setDate(now.getDate() + 15);
                tipofecha = 'FCI'
                break;
            case 'canceladas':
                statusSelected = ['CA', 'RE'];
                desde.setDate(now.getDate() - 90);
                hasta = now;
                tipofecha = 'FRV'
                break;
            case 'pendientes':
                statusSelected = ['PE'];
                desde.setDate(now.getDate() - 90);
                hasta = now;
                tipofecha = 'FRV'
                break;
        }

        if (getReservasconRango == 1) {
            desdeTrans = this.datePipe.transform(desde, 'yyyy-MM-dd');
            hastaTrans = this.datePipe.transform(hasta, 'yyyy-MM-dd');
            params = 'tipofecha=' + tipofecha + '&desde=' + desdeTrans + '&hasta=' + hastaTrans + '&status=' + statusSelected;
        }
        /* let desdeTrans = this.datePipe.transform(desde, 'yyyy-MM-dd');
        let hastaTrans = this.datePipe.transform(hasta, 'yyyy-MM-dd');
        let params = 'tipofecha=' + tipofecha + '&desde=' + desdeTrans + '&hasta=' + hastaTrans + '&status=' + statusSelected; */
        this.filterRequest(params);
    }

    toolHtml(detalles) {
        let html = '<div class="text-left">Pasajeros:</div>';
        for (var i = 0; i < detalles.length; i++) {
            html += '<div class="text-left text-uppercase">' + (i + 1) + ': ' + detalles[i].nombre + '</div>'
        };
        return html;
    }
    toolHtml2(detalles) {
        let utilidad = detalles.importe_publico - detalles.importe_agencia;
        let html = '<div class="text-left">Importe agencia:</div>';
        html += '<div class="text-center text-uppercase">' + '$' + formatCurrency(detalles.importe_agencia, 'en-EN', '', '1') + '</div>'
        html += '<div class="text-center">Utilidad:</div>' + '$' + formatCurrency(utilidad, 'en-EN', '', '1') + ' (' + detalles.utilidad + '%)';

        return html;
    }

    verDetalleReserva(id) {
        // this.spinnerService.show();
        this.showloader();
        const modalRef = this.modalService.open(ReservaDetalleComponent, { backdrop: 'static' });
        modalRef.componentInstance.id = id;
        this.hideLoader();
    }

    cancelarReservaModalService(id) {
        // this.spinnerService.show();
        this.showloader();
        this.reservacionesService.getDataCancelacion(id).subscribe((res) => {
            var dataCancelacion = res;
            if (dataCancelacion.status == "success") {
                if (dataCancelacion.data.cancelacion_automatica == 1) {
                    const modalRef = this.modalService.open(CancelacionComponent, { backdrop: 'static' });
                    modalRef.result.then((result) => {
                        console.log("result");
                        this.filtrar();

                    });
                    modalRef.componentInstance.data = dataCancelacion.data;
                }
                else {
                    this.swal.info(dataCancelacion.title, dataCancelacion.msg);
                }
            } else {
                this.swal.error(dataCancelacion.title, dataCancelacion.msg);
            }
            // this.spinnerService.hide();
            this.hideLoader();
        });

    }

    pagarRes(reserva: any) {
        var title;
        this.translate.get('reservaciones.lo-sentimos').subscribe((data: any) => { title = data; });
        var msg;
        this.translate.get('reservaciones.accion-n-posible').subscribe((data: any) => { msg = data; });
        if ((reserva.datosreserva.status == 'CO') && (this.idOpe == 'AZAMID' || this.idOpe == 'AZAMTY' || this.idOpe == 'AZAMX' || this.idOpe == 'BDPRO' || this.idOpe == 'CLICKO')) {
            // const modalRef = this.modalService.open(PagarReservaComponent, { backdrop: 'static', size: 'lg' });
            const modalRef = this.modalService.open(PagarReservaPayoffComponent, { backdrop: 'static', size: 'lg' });
            modalRef.componentInstance.reserva = reserva;
            modalRef.result.then((result) => {
                this.mostrarLigaPago(result);
            });
        } else {
            this.swal.error(title, msg);
        }
    }

    mostrarLigaPago(url: string) {
        const modalLiga = this.modalService.open(MostarLigaPagoComponent, { backdrop: 'static', size: 'lg' });
        modalLiga.componentInstance.liga = url;

        modalLiga.result.then((resultado) => {
            this.filtrar();
        });
    }

    downloadCVS() {
        let params = this.pramsFiltros + '&download=1';

        this.reservacionesService.downloadCVS(params).subscribe(response => {
            this.linkDownload = response.link;
            window.open(this.linkDownload)
        });
    }

    @ViewChild('quantity') quantity: ElementRef;
    filtrarAereos() {
        var idAereo = (this.filtroFormAereos.value.idAereos != '') ? '&filters[locator]=' + this.filtroFormAereos.value.idAereos : '';
        var titularAereos = (this.filtroFormAereos.value.titularAereos != '') ? '&filters[client_name]=' + this.filtroFormAereos.value.titularAereos : '';
        var origenAereos = (this.filtroFormAereos.value.origenAereos != '') ? '&filters[origin_id]=' + this.iataOrigen : '';
        var destinoAereos = (this.filtroFormAereos.value.destinoAereos != '') ? '&filters[destination_id]=' + this.iataDestino : '';
        var aereolineaAereos = (this.filtroFormAereos.value.aereolineaAereos != '') ? '&filters[airline]=' + this.iataAirline : '';
        var statusAereos = (this.filtroFormAereos.value.statusAereos != '') ? '&filters[status]=' + this.filtroFormAereos.value.statusAereos : '';
        var fechaDe = this.quantity.nativeElement.value;
        var fechaDesde = moment(this.filtroFormAereos.value.desdeAereos).format('YYYY-MM-DD');
        var fechaHasta = moment(this.filtroFormAereos.value.hastaAereos).format('YYYY-MM-DD');
        var desde = '&filters[' + fechaDe + '_date_from]=' + fechaDesde;
        var hasta = '&filters[' + fechaDe + '_date_to]=' + fechaHasta;

        let params = idAereo + titularAereos + origenAereos + destinoAereos + aereolineaAereos + desde + hasta + statusAereos;
        // this.spinnerService.show();
        this.filterRequestAereos(0, params);
    }

    filterRequestAereos(page, params) {
        // this.pramsFiltrosAereos = params;
        this.params = params;
        // this.spinnerService.show();
        this.showloader();
        this.aereosService.getControlBoookingPaginated(page, params).subscribe(response => {
            this.listAereos = response.flights;
            this.currentPage = response.meta.pagination.current_page;
            this.totalPages = response.meta.pagination.total_pages;
            this.totalResultados = response.meta.pagination.total;
            this.hideLoader();
        }, error => {
            this.hideLoader();
        });
    }

    goToPage(page) {

        this.filterRequestAereos(page, this.params)
    }

    autocompleteAirport(airportName) {
        this.destinos = new Observable((observer: Observer<any>) => {
            observer.next(airportName);
        }).pipe(
            switchMap((query: any) => {
                if (query) {
                    return this.aereosService.autocompleAirport(query);
                }
                return of([]);
            })
        );
    }

    onSelectAirport(event: TypeaheadMatch, type): void {
        if (type == "origen") {
            this.filtroFormAereos.patchValue({
                origenAereos: "(" +
                    event.item.codigo +
                    ") " +
                    event.item.ciudad +
                    ", " +
                    event.item.pais
            });
            this.iataOrigen = event.item.codigo
        }
        else if (type == "destino") {
            this.filtroFormAereos.patchValue({
                destinoAereos: "(" +
                    event.item.codigo +
                    ") " +
                    event.item.ciudad +
                    ", " +
                    event.item.pais
            });
            this.iataDestino = event.item.codigo
        }
    }

    onSelectAirlines(event) {
        this.filtroFormAereos.patchValue({ aereolineaAereos: event.item.name + " (" + event.item.id + ")" });
        this.iataAirline = event.item.id;
    }

    autocompleteAirline(airlineName) {
        this.airlines = new Observable((observer: Observer<any>) => {
            observer.next(airlineName);
        }).pipe(
            switchMap((query: any) => {
                if (query) {
                    return this.aereosService.autocompleteAirlines(query);
                }
                return of([]);
            })
        )

    }

    getStatus() {
        this.aereosService.getStatus().subscribe(response => {
            this.statusSelect = response.data;
        });
    }
}
