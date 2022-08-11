import { Component, OnInit } from '@angular/core';
import { AgenciaService, AuthenticationService, HotelService, SharedService } from '../../services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PoliticasComponent } from './politicas/politicas.component';
import { SweetalertService } from '../../services/sweetalert.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-booking',
    templateUrl: './booking.component.html',
    styleUrls: [],
})
export class BookingComponent implements OnInit {
    //estatica oara carga de parametros en view
    aceptTerms = false;
    itemReserva;
    datoshotel;
    datosroom;
    datosplan;
    habitaciones;
    fechas;
    detalle_reserva;

    pax = [];
    user;
    paramsBusqueda;
    importeTotalCalculado;
    currencyAgencia;
    idAgencia;
    agencia;
    calculo;
    queryParams;
    difCurrency = false;
    constructor(
        private hotelService: HotelService,
        public sweetAlertService: SweetalertService,
        private router: Router,
        public sharedService: SharedService,
        private modalService: NgbModal,
        public agenciaService: AgenciaService,
        public activatedRoute: ActivatedRoute,
        private translate: TranslateService,
        private auth: AuthenticationService
    ) {
        this.sharedService.usuarioObserver.subscribe((user) => {
            this.user = user;
        });
        this.activatedRoute.queryParams.subscribe((params) => {
            this.queryParams = params;
        });
        this.auth.getLang().subscribe(res=>{
            translate.setDefaultLang(res);
        });
    }

    ngOnInit() {
        window.scroll(0, 0);
        this.itemReserva = JSON.parse(localStorage.getItem('item_res'));
        this.datoshotel = this.itemReserva.datoshotel;
        this.datosroom = this.itemReserva.datosroom;
        this.datosplan = this.itemReserva.datosplan;
        this.habitaciones = this.itemReserva.paxs;
        this.fechas = this.itemReserva.fechas;
        this.detalle_reserva = this.itemReserva;
        this.sharedService.getParamsBusquedaHotel().subscribe((params) => {
            this.paramsBusqueda = params;
        });

        let currencyTarifa = this.datosroom.currency_divisa.currency;
        let importeTarifa = this.datosroom.currency_divisa.currency;
        this.agenciaService.getAgencia(this.idAgencia).subscribe((agencia) => {
            this.sharedService.setAgencia(agencia);
            this.agencia = agencia;
            this.currencyAgencia = agencia.currency;
            this.getTasaCambio(this.currencyAgencia, currencyTarifa);
            if(this.currencyAgencia != this.detalle_reserva.currency.currency){
                this.difCurrency = true;
            }
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
        var error_validacion;
        this.translate.get('hotel.error-validacion').subscribe((data:any)=> { error_validacion = data;});
        var campos_requeridos;
        this.translate.get('hotel.campos-requeridos').subscribe((data:any)=> { campos_requeridos = data;});
        var datos_duplicados;
        this.translate.get('hotel.huespedes-duplicados').subscribe((data:any)=> { datos_duplicados = data;});
        var isValid = true;
        var fullnames = [];
        var msgValidacion;
        var format = /[¡¿¬!@#$%^&*./"´'¨()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        for (var i = 0; i < paxs.length; i++) {
            if (!paxs[i].chk) {
                if ( paxs[i].apellidos === '' || typeof paxs[i].apellidos === 'undefined' ) {
                    paxs[i].apellidoinvalid = true;
                    this.translate.get('hotel.apellidos-vacio').subscribe((data:any)=> { msgValidacion = data;});
                    isValid = false;
                }
                if ( paxs[i].nombres === '' || typeof paxs[i].nombres === 'undefined' ) {
                    paxs[i].nombreinvalid = true;
                    this.translate.get('hotel.nombres-vacio').subscribe((data:any)=> { msgValidacion = data;});
                    isValid = false;
                }
                if((paxs[i].nombres != '' || typeof paxs[i].nombres != 'undefined') && format.test(paxs[i].nombres)){
                    this.translate.get('hotel.caracteres-invalidos-nombre').subscribe((data:any)=> { msgValidacion = data;});
                    isValid = false;
                }
                if((paxs[i].apellidos != '' || typeof paxs[i].apellidos != 'undefined') && format.test(paxs[i].apellidos)){
                    this.translate.get('hotel.caracteres-invalidos-apellido').subscribe((data:any)=> { msgValidacion = data;});
                    isValid = false;
                }
            }
            var fullname =
                paxs[i].nombres
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '') +
                paxs[i].apellidos
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
            fullnames.push(fullname);
        }

        if (!isValid) {
            this.sweetAlertService.info(
                error_validacion,
                msgValidacion
            );
            return false;
        } else {
            var duplicates = fullnames.reduce(function (acc, el, i, arr) {
                if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el);
                return acc;
            }, []);
    
            if (duplicates != '') {
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
        var waitReservation;
        this.translate.get('hotel.wait-reservation').subscribe((data:any)=> { waitReservation = data;});
        if (this.validarHabitaciones(this.habitaciones)) {
            var $reserva = {
                idBroker: this.datoshotel.idBroker,
                hotel_id: this.datoshotel.hotel_id,
                hotel_producto: this.datoshotel.hotel_producto,
                room_id: this.datosroom.room_id,
                plan_id: this.datosplan.plan_id,
                nombre_hotel: this.datoshotel.nombre_hotel,
                nombre_room: this.datosroom.nombre_room,
                nombre_plan: this.datosplan.nombre_plan,
                importe_publico: this.detalle_reserva.importe,
                importe_neto: this.detalle_reserva.importe_neto,
                importe_neta_operador:
                    this.detalle_reserva.importe_neta_operador,
                checkin: this.fechas.finicioSql,
                checkout: this.fechas.ffinalSql,
                habitaciones: this.habitaciones,
                reserva_currency: this.detalle_reserva.currency.currency,
                reserva_currency_tc: this.detalle_reserva.currency.tasa_cambio,
                informacion_importante:
                    this.datoshotel.informacion_importante || '',
                hotel_politicas: this.datoshotel.hotel_politicas || '',
                status_room: this.datosroom.status,
                book: this.detalle_reserva.book,
                destino: this.datoshotel.destino,
                outlet: this.detalle_reserva.outlet,
                nationality_search: this.agencia.nationality_search
            };

            this.sweetAlertService.progress(realizandoReservacion,'<br> <small>'+waitReservation+'</small>' );
            // cbh.disabledBtnConfirmar = true;
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
                        ''
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
        return re.test(String.fromCharCode(event.keyCode).replace(/[!@#$%^&*./"´'¨()_+\-=\[\]{};':"\\|,.<>\/?]+/g, ''));
    }
}
