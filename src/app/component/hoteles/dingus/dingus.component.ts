import { Component, OnInit } from '@angular/core';
import { AgenciaService, AuthenticationService, HotelService, SharedService } from '@app/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PoliticasComponent } from '../politicas/politicas.component';
import { SweetalertService } from '../../../services/sweetalert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-dingus',
    templateUrl: './dingus.component.html',
    styleUrls: [],
})
export class DingusComponent implements OnInit {
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
    idAgencia;
    agencia;
    calculo;
    fechas_limite;
    politicas_reserva;
    user;
    paramsBusqueda;
    importeTotalCalculado;
    currencyAgencia;
    queryParams;
    constructor(
        private hotelService: HotelService,
        public sweetAlertService: SweetalertService,
        private modalService: NgbModal,
        public sharedService: SharedService,
        private router: Router,
        public agenciaService: AgenciaService,
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
        this.idAgencia = JSON.parse(localStorage.getItem('access_agen'));
        this.politicas = this.itemReserva.politicas;
        this.info_importante = '';
        this.datoshotel = this.itemReserva.datoshotel;
        this.datosroom = this.itemReserva.datosroom;
        this.datosplan = this.itemReserva.datosplan;
        this.habitaciones = this.itemReserva.paxs;
        this.fechas = this.itemReserva.fechas;
        this.detalle_reserva = this.itemReserva;
        this.politicas_reserva = this.itemReserva.checkRate.hotel.politicas;
        this.info_importante = this.itemReserva.checkRate.rateComments;

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

        /* this.sharedService.getParamsBusquedaHotel().subscribe(params => {
      this.paramsBusqueda = params;
    }) */

        let currencyTarifa = this.datosroom.currency_divisa.currency;
        let importeTarifa = this.datosroom.currency_divisa.currency;
        this.agenciaService.getAgencia(this.idAgencia).subscribe((agencia) => {
            this.sharedService.setAgencia(agencia);
            this.agencia = agencia;
            this.currencyAgencia = agencia.currency;
            this.getTasaCambio(this.currencyAgencia, currencyTarifa);
        });
    }
    getTasaCambio(currencyAgencia, currencyTarifa) {
        var moneda = currencyAgencia;
        var tarifa;
        this.hotelService.getTasacambio(moneda).subscribe((res) => {
            var tasasCambio = res.data;
            tarifa = tasasCambio.find(function (t) {
                if (t.currency == currencyTarifa) {
                    return t;
                }
            });
            this.calculo = tarifa.tasaCambio;
            this.importeTotalCalculado = this.calculateTDC(
                moneda,
                this.detalle_reserva.importe,
                this.calculo
            );
        });
    }
    calculateTDC(currencyAgencia, tarifaHotel, tasaCambio) {
        let currencyRoomHotel = this.datosroom.currency_divisa.currency;
        let total;
        var tasa_cambio_tarifa_hotel =
            this.detalle_reserva.currency.tasa_cambio;
        if (currencyAgencia == 'USD') {
            if (currencyRoomHotel != currencyAgencia) {
                total = tarifaHotel * tasaCambio;
            } else {
                total = tarifaHotel * tasa_cambio_tarifa_hotel;
            }
        } else {
            total = tarifaHotel * tasa_cambio_tarifa_hotel;
        }
        return total;
    }

    validarHabitaciones(paxs) {
        var errorValidacion;
        var huespedesDuplicados;
        // var camposRequeridos;
        // this.translate.get('hotel.campos-requeridos').subscribe((data:any)=> { camposRequeridos = data;});
        this.translate.get('hotel.error-validacion').subscribe((data:any)=> { errorValidacion = data;});
        this.translate.get('hotel.huespedes-duplicados').subscribe((data:any)=> { huespedesDuplicados = data;});
        var isValid = true;
        var fullnames = [];
        var msgValidacion;
        var format = /[¡¿¬!@#$%^&*./"´'¨()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        for (var i = 0; i < paxs.length; i++) {
            if (!paxs[i].chk) {
                paxs[i].paxes.forEach((elem) => {
                    if (elem.type === "AD" &&(elem.edad === "" || typeof elem.edad === "undefined" ||  elem.edad < 18 )) {
                        this.translate.get('hotel.verifique-edad-adultos').subscribe((data:any)=> { msgValidacion = data;});
                        // msgValidacion = "Verifique la edad de los adultos";
                        isValid = false;
                    }
                    if ( elem.apellidos === '' || typeof elem.apellidos === 'undefined' ) {
                        this.translate.get('hotel.apellidos-vacio').subscribe((data:any)=> { msgValidacion = data;});
                        // msgValidacion = "Campo apellidos vacío";
                        isValid = false;
                    }
                    if ( elem.nombres === '' || typeof elem.nombres === 'undefined' ) {
                        this.translate.get('hotel.nombres-vacio').subscribe((data:any)=> { msgValidacion = data;});
                        // msgValidacion = "Campo nombres vacío";
                        isValid = false;
                    }
                    if( (elem.nombres != '' || typeof elem.nombres != 'undefined') && format.test(elem.nombres)){
                        this.translate.get('hotel.caracteres-invalidos-nombre').subscribe((data:any)=> { msgValidacion = data;});
                        // msgValidacion = "No se permite uso de punto y/o caracteres especiales en nombres";
                        isValid = false;
                    }
                    if( (elem.apellidos != '' || typeof elem.apellidos != 'undefined') && format.test(elem.apellidos)){
                        this.translate.get('hotel.caracteres-invalidos-apellido').subscribe((data:any)=> { msgValidacion = data;});
                        // msgValidacion = "No se permite uso de punto y/o caracteres especiales en apellidos";
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
                errorValidacion,
                msgValidacion
            );
            return false;
        } else {
            var duplicates = fullnames.reduce(function(acc, el, i, arr) {
                if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el); return acc;
            }, []);

            if(duplicates != ''){
                this.sweetAlertService.info(
                    errorValidacion,
                    huespedesDuplicados
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
            var $reserva = {
                idBroker: this.datoshotel.idBroker,
                hotel_id: this.datoshotel.hotel_id,
                room_id: this.datosroom.room_id,
                plan_id: this.datosplan.plan_id,
                nombre_hotel: this.datoshotel.nombre_hotel,
                nombre_room: this.datosroom.nombre_room,
                nombre_plan: this.datosplan.nombre_plan,
                destino: this.datoshotel.destino,
                importe_publico: this.detalle_reserva.importe,
                importe_neto: this.detalle_reserva.importe_neto, //checar origen
                importe_neto_operador:
                    this.detalle_reserva.importe_neto_operador, //checar origen
                checkin: this.fechas.finicioSql,
                checkout: this.fechas.ffinalSql,
                habitaciones: this.habitaciones,
                reserva_currency: this.detalle_reserva.currency.currency,
                reserva_currency_tc: this.detalle_reserva.currency.tasa_cambio,
                politicas:
                    this.detalle_reserva.checkRate.hotel.politicas.descripcion,
                important_info: this.detalle_reserva.checkRate.rateComments,
                book: this.detalle_reserva.checkRate.hotel.broker_book,
                outlet: this.detalle_reserva.outlet,
                nationality_search: this.agencia.nationality_search
            };
            this.sweetAlertService.progress(realizandoReservacion,'<br> <small>'+waitReservation+'</small>' );

            this.hotelService.booking($reserva).subscribe(
                (r) => {
                    if (typeof r.status == 'undefined') {
                        this.sweetAlertService.error(
                            error,
                            errorSistema
                        );
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
                            case 'error':
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
                    this.router.navigate(['/reservaciones']);
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

    soloNumLetras(event) {
        var re = /^[a-zA-Z.\u00C0-\u017F/\s/]+$/;
        return re.test(String.fromCharCode(event.keyCode).replace(/[¡¿¬!@#$%^&*./"´'¨()_+\-=\[\]{};':"\\|,.<>\/?]+/g, ''));
    }
}
