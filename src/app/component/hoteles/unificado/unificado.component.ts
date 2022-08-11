import { Component, OnInit } from '@angular/core';
import { AuthenticationService, HotelService, SharedService } from '@app/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PoliticasComponent } from '../politicas/politicas.component';
import { SweetalertService } from '../../../services/sweetalert.service';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
moment.locale('es');
@Component({
    selector: 'app-unificado',
    templateUrl: './unificado.component.html',
    styles: [],
})
export class UnificadoComponent implements OnInit {
    aceptTerms = false;
    itemReserva;
    datoshotel;
    datosroom;
    datosplan;
    habitaciones;
    fechas;
    detalle_reserva;
    politicas;
    info_importante;
    pax = [];

    // prereserva_rstl;
    fechas_limite;
    politicas_reserva;
    user;
    comments;
    // confirm_book
    paramsBusqueda;
    queryParams;
    constructor(
        private hotelService: HotelService,
        public sweetAlertService: SweetalertService,
        private modalService: NgbModal,
        public sharedService: SharedService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private translate: TranslateService,
        private auth: AuthenticationService
    ) {
        this.sharedService.usuarioObserver.subscribe((user) => {
            this.user = user;
        });
        this.auth.getLang().subscribe(res=>{
            translate.setDefaultLang(res);
        });
    }

    ngOnInit() {
        
        window.scroll(0, 0);
        this.itemReserva = JSON.parse(localStorage.getItem('item_res'));
        console.info('el item de reserva', this.itemReserva);
        this.politicas = this.itemReserva.politicas;
        this.info_importante = '';
        this.datoshotel = this.itemReserva.datoshotel;
        this.datosroom = this.itemReserva.datosroom;
        this.datosplan = this.itemReserva.datosplan;
        this.habitaciones = this.itemReserva.paxs;
        this.fechas = this.itemReserva.fechas;
        this.detalle_reserva = this.itemReserva;
        this.politicas_reserva = '';
        this.info_importante = '';
        this.hotelService.fechasLimite.subscribe((f) => {
            if (f) {
                this.fechas_limite = f;
            } else {
                this.fechas_limite = { fla: '', flh: '' };
            }
        });
        this.activatedRoute.queryParams.subscribe((params) => {
            this.queryParams = params;
        });
    }

    calculateTDC(tar) {
        var tarifa = tar;
        var tasa_cambio = this.detalle_reserva.exchange.exchange_rate;
        // var tasa_cambio = 1;
        var total = tarifa * tasa_cambio;
        return total;
    }

    formatDateSpanish(fecha) {
        var dateString = moment(fecha).format('ddd D MMM YY');
        return dateString;
    }

    validarHabitaciones(paxs) {
        var error_validacion;
        var campos_requeridos;
        var datos_duplicados;
        this.translate.get('hotel.error-validacion').subscribe((data:any)=> { error_validacion = data;});
        this.translate.get('hotel.campos-requeridos').subscribe((data:any)=> { campos_requeridos = data;});
        this.translate.get('hotel.huespedes-duplicados').subscribe((data:any)=> { datos_duplicados = data;});
        var isValid = true;
        var fullnames = [];
        var msgValidacion;
        var format = /[¡¿¬!@#$%^&*./"´'¨()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        for (var i = 0; i < paxs.length; i++) {
            if (!paxs[i].chk) {
                paxs[i].paxes.forEach((elem) => {
                    if (elem.type === "AD" &&(elem.edad === "" || typeof elem.edad === "undefined" ||  elem.edad < 18 )) {
                        this.translate.get('hotel.verifique-edad-adultos').subscribe((data:any)=> { msgValidacion = data;});
                        isValid = false;
                    }
                    if ( elem.apellidos === '' || typeof elem.apellidos === 'undefined' ) {
                        this.translate.get('hotel.apellidos-vacio').subscribe((data:any)=> { msgValidacion = data;});
                        isValid = false;
                    }
                    if ( elem.nombres === '' || typeof elem.nombres === 'undefined' ) {
                        this.translate.get('hotel.nombres-vacio').subscribe((data:any)=> { msgValidacion = data;});
                        isValid = false;
                    }
                    if(elem.titulo === '' || typeof elem.titulo === 'undefined'){
                        this.translate.get('hotel.seleccione-titulo').subscribe((data:any)=> { msgValidacion = data;});
                        // msgValidacion = "Seleccione un titulo";
                        isValid = false;
                    }
                    if((elem.nombres != '' || typeof elem.nombres != 'undefined') && format.test(elem.nombres)){
                        this.translate.get('hotel.caracteres-invalidos-nombre').subscribe((data:any)=> { msgValidacion = data;});
                        isValid = false;
                    }
                    if((elem.apellidos != '' || typeof elem.apellidos != 'undefined') && format.test(elem.apellidos)){
                        this.translate.get('hotel.caracteres-invalidos-apellido').subscribe((data:any)=> { msgValidacion = data;});
                        isValid = false;
                    }

                    var fullname =
                        elem.nombres
                            .toLowerCase()
                            .replace(/\s+/g, '')
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '') +
                        elem.apellidos
                            .toLowerCase()
                            .replace(/\s+/g, '')
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '');

                    fullnames.push(fullname);
                });
            }
        }
        if (!isValid) {
            this.sweetAlertService.info(
                error_validacion,
                msgValidacion
            );
            return false;
        } else {
            var duplicates = fullnames.reduce(function(acc, el, i, arr) {
                if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el); return acc;
            }, []);

            if(duplicates != ''){
                this.sweetAlertService.info(
                    error_validacion,
                    datos_duplicados
                );
                return false;
            }else{
                return true;
            }
        }
    }

    confirmarBook() {
        var realizandoReservacion;
        this.translate.get('hotel.realizando-reservacion').subscribe((data:any)=> { realizandoReservacion = data;});
        var error;
        this.translate.get('hotel.error').subscribe((data:any)=> { error = data;});
        var errorSistema;
        this.translate.get('hotel.error-sistema').subscribe((data:any)=> { errorSistema = data;});
        var msg;
        this.translate.get('hotel.status-reserva').subscribe((data:any)=> { msg = data;});
        var waitReservation;
        this.translate.get('hotel.wait-reservation').subscribe((data:any)=> { waitReservation = data;});
        if (this.validarHabitaciones(this.habitaciones)) {
            var count = 0;
            var $roomGuest = [];
            var holder;
            

            this.habitaciones.forEach((habita, ihab) => {
                var guestInfo = [];
                habita.paxes.forEach((paxs, ipx) => {
                    if (ihab == 0 && ipx == 0) {
                        holder = {
                            title: paxs.titulo,
                            names: paxs.nombres,
                            surnames: paxs.apellidos,
                            comments: '',
                            email: '',
                            phone: '',
                        };
                    }
                    if (paxs.type == 'AD') {
                        var typeroom = 'adt';
                    } else {
                        var typeroom = 'mnr';
                    }
                    
                    var gi = {
                        title: paxs.titulo,
                        age: paxs.edad,
                        names: paxs.nombres,
                        surnames: paxs.apellidos,
                        type: typeroom,
                    };
                    guestInfo.push(gi);
                });
                var $pax = {
                    occupancy_id: count,
                    guests: guestInfo,
                    comments: !habita.comments ? '' : habita.comments,
                };
                $roomGuest.push($pax);
                count++;
            });

            var $reserva = {
                broker: this.datoshotel.broker,
                rate_key: this.itemReserva.book,
                guests_ocupancy: $roomGuest,
                holder: holder,
            };

            // console.info('antes del booking', $reserva);
            // return false;
            this.sweetAlertService.progress(realizandoReservacion,'<br> <small>'+waitReservation+'</small>' );

            this.hotelService.booking($reserva).subscribe(
                (r) => {
                    if (typeof r.status == 'undefined') {
                        this.sweetAlertService.error(
                            error,
                            errorSistema
                        );
                        this.router.navigate(['/reservaciones']);
                    } else {
                        this.sweetAlertService.closeSwal();
                        switch (r.status) {
                            case 'success':
                                // var msg =
                                //     '<br> <small>Por favor, no cierre esta ventana, mientras estamos generando tu reservación, este proceso puede durar hasta 120 segundos, gracias.</small>';
                                this.sweetAlertService.success(
                                    r.title,
                                    r.msg
                                );
                                localStorage.removeItem('params_busqueda');
                                this.router.navigate(['/reservaciones']);
                                break;
                            case 'warning':
                                this.sweetAlertService.warning(r.title, r.msg);
                                localStorage.removeItem('params_busqueda');
                                this.router.navigate(['/reservaciones']);
                                break;
                            case error:
                                this.sweetAlertService.error(r.title, r.msg);
                                localStorage.removeItem('params_busqueda');
                                this.router.navigate(['/reservaciones']);
                                break;
                            default:
                                this.sweetAlertService.info(r.title, r.msg);
                                localStorage.removeItem('params_busqueda');
                                this.router.navigate(['/reservaciones']);
                                break;
                        }
                    }
                },
                (err) => {
                    this.sweetAlertService.closeSwal();
                    this.sweetAlertService.error(
                        error,
                        msg
                    );
                    localStorage.removeItem('params_busqueda');
                    this.router.navigate(['/home']);
                }
            );
        }
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
            size: 'lg',
        });
    }

    onlyNumberKey(event) {
        return event.charCode == 8 || event.charCode == 0
            ? null
            : event.charCode >= 48 && event.charCode <= 57;
        // (keypress)="onlyNumberKey($event)"
    }

    soloNumLetras(event)
    {
        var re = /[a-zA-Z.\u00C0-\u017F/\s/]+$/;
        return re.test(String.fromCharCode(event.keyCode).replace(/[¡¿¬!@#$%^&*./"´'¨()_+\-=\[\]{};':"\\|,.<>\/?]+/g, ''));
    }
}
