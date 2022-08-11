import { pipe } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService, FirebaseService, TraciturService, SweetalertService, AuthenticationService } from '@app/services';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PoliticasComponent } from '@app/component/hoteles/politicas/politicas.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-booking-tracitur',
    templateUrl: './booking-tracitur.component.html',
    styleUrls: [],
})
export class BookingTraciturComponent implements OnInit, OnDestroy {
    serviceForm: FormGroup;
    servicePaxForm;
    servicePaxArray;
    selectPais;
    serviceBooking;
    user;
    currentUser;
    currencies = [];
    submitted = false;
    loading = false;
    aceptTerms = false;

    totalarr = [];
    optionSelected = [];
    currency;
    type;
    typePath;

    suplementos = [];
    aerolines;
    hourSelect = true;

    constructor(
        private sharedService: SharedService,
        private firebaseService: FirebaseService,
        private traciturService: TraciturService,
        private fb: FormBuilder,
        private swal: SweetalertService,
        private router: Router,
        private modalService: NgbModal,
        private translate: TranslateService,
        private auth: AuthenticationService
    ) {
        this.serviceBooking = JSON.parse(localStorage.getItem('service_book'));
        this.sharedService.usuarioObserver.subscribe((user) => {
            this.user = user;
        });
        this.firebaseService.currencies.subscribe((data) => {
            const currencies = [];
            Object.keys(data).forEach((key) => {
                currencies.push(data[key]);
            });
            this.currencies = currencies;
        });

        this.serviceForm = this.fb.group({
            nombres: ['', Validators.required],
            apellidos: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            telefonos: ['', Validators.required],
            observaciones: [''],
        });
        this.auth.getLang().subscribe(res=>{
            translate.setDefaultLang(res);
        });
    }

    ngOnInit() {
        // if (this.serviceBooking.ratesDetails) {}
        this.servicePaxForm = this.fb.group({
            room: this.fb.array(
                this.getRooms(this.serviceBooking.ratesDetails).map((room) =>
                    this.fb.group(room)
                )
            ),
        });
        this.type = this.serviceBooking.info.type;
        this.currency = this.serviceBooking.total.currency;
        switch (this.type) {
            case 'TRA':
                this.typePath = 'traslados';
                break;
            case 'CIR':
                this.typePath = 'circuitos';
                break;
            case 'TOU':
                this.typePath = 'tours';
                break;
        }
        this.setDefaultOpcionRequired();
        this.aerolinesList();
        this.calcularTotal(this.serviceBooking);
        this.getSuplementos(this.type, this.serviceBooking.info.idDestino);
    }

    get f() {
        return this.serviceForm.controls;
    }
    get p() {
        return this.servicePaxForm.controls.room.controls;
    }

    calculateTDC(tarf, tdc) {
        let currency_user = this.user;
        if (tdc === null || tdc == 0) {
            var tasaCambioFB = this.currencies.find(function (tc) {
                return tc.currency_name == currency_user.currency;
            });
            tdc = tasaCambioFB?.tasa_cambio;
        }

        var total_currency = tarf * tdc;

        return total_currency;
    }

    getRooms(rooms) {
        const roomControlArray = [];
        for (let i = 1; i <= rooms.length; i++) {
            roomControlArray.push({
                tipoHab: [''],
                nombres: ['', Validators.required],
                apellidos: ['', Validators.required],
                observaciones: [''],
            });
        }
        return roomControlArray;
    }

    setDefaultOpcionRequired() {
        if (this.serviceBooking.tarifas.opciones !== null) {
            for (const r of this.serviceBooking.tarifas.opciones) {
                if (r.requerido === true) {
                    for (const s of r.opciones) {
                        if (s.default === true) {
                            this.serviceBooking.optionSelected[r.id] = s;
                        }
                    }
                }
            }
        }
    }

    calcularTotal(book) {
        book.total.gt_neto = parseInt(book.total.neto);
        book.total.gt_publico = parseInt(book.total.publico);
        if (typeof book.suplements !== 'undefined') {
            for (const s of book.suplements) {
                const imp = s.cantidad * parseInt(s.costo);
                book.total.gt_publico += imp;
            }
        }
        if (typeof this.serviceBooking.optionSelected !== 'undefined') {
            const total = book.total;
            let op_total_neto =
                typeof total.op_total_neto !== 'undefined'
                    ? total.op_total_neto
                    : 0;
            let op_total_publico =
                typeof total.op_total_publico !== 'undefined'
                    ? total.op_total_publico
                    : 0;
            book.total.gt_neto += op_total_neto;
            book.total.gt_publico += op_total_publico;
        }
    }

    getSuplementos(typeService, idDestino) {
        this.traciturService
            .getSuplementos(typeService, idDestino)
            .subscribe((r) => {
                this.suplementos = r;
            });
    }

    aerolinesList() {
        this.traciturService.getAeropuertos().subscribe((r) => {
            this.aerolines = r;
        });
    }

    //   $scope.$watchCollection(
    //     "baddons.optionSelected",
    //     function(newValue, oldValue) {
    //         if (newValue && newValue != 'undefined') {
    //             setOptionsTotals(newValue);
    //         }
    //     }
    //   );

    doBooking(book, optionSelected) {
        var realizandoReservacion;
        this.translate.get('tracitur.realizando-reservacion').subscribe((data: any) => { realizandoReservacion = data; });
        var error;
        this.translate.get('tracitur.error').subscribe((data: any) => { error = data; });
        var errorInesperado;
        this.translate.get('tracitur.error-inesperado').subscribe((data: any) => { errorInesperado = data; });
        this.submitted = true;
        this.hourSelect = true;
        if (this.serviceForm.invalid) {
            // this.swal.warning('Llene todos los campos');
            if (this.type != 'TRA' && book.info.horarios != null && (typeof book.horarioSalida == 'undefined' || book.horarioSalida == 0)) {
                this.hourSelect = false;
                return;
            }
            return;
        }
        this.loading = true;
        book.datoscontacto = this.serviceForm.value;
        if (this.type == 'CIR') {
            book.pax = this.servicePaxForm.value.room;
        }
        const pagado = 'success';
        book.statuspago = pagado;
        if (typeof optionSelected !== 'undefined') {
            book.optionSelected = optionSelected;
        }

        this.swal.progress(realizandoReservacion);
        this.traciturService.doReservaService(book).subscribe((r) => {
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

    toggleTerms(event) {
        if (event.target.checked) {
            this.aceptTerms = true;
        } else {
            this.aceptTerms = false;
        }
    }

    TerminosYCondiciones() {
        this.modalService.open(PoliticasComponent, {
            size: 'lg',
        });
    }

    goBackResults() {
        this.router.navigate([`/${this.typePath}`]);
        localStorage.removeItem('service_book');
    }

    ngOnDestroy() {
        localStorage.removeItem('service_book');
    }
}
