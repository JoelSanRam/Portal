import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { TrasladosService, SharedService } from '@app/services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faSafari } from '@fortawesome/free-brands-svg-icons';
import { DatePipe } from "@angular/common";
import { TrasladosComponent } from "../../traslados/traslados.component";
import { filter, min, max, sortBy, uniq, includes, find, get, pull } from "lodash-es";
import { BsDatepickerDirective, BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import * as moment from 'moment';
defineLocale('es', esLocale);

@Component({
    selector: 'app-buscador-traslado',
    templateUrl: './buscador-traslado.component.html',
    styleUrls: []
})
export class BuscadorTrasladoComponent implements OnInit {
    @ViewChild('dpsf', { static: true }) datepicker: BsDatepickerDirective;
    @ViewChild('dpsr', { static: true }) datepickerFR: BsDatepickerDirective;
    bsConfig: Partial<BsDatepickerConfig>;
    minDate = new Date(Date.now());

    submitted = false;
    loading = false;
    returnUrl: string;
    encrypbusqueda;
    today = new Date();
    trasladosForm: FormGroup;
    fechaServicio;
    fechaRegreso;
    fr_storage;
    meses;
    mesServicio;
    anioServicio;
    mesRegreso;
    anioRegreso;
    destinos;
    aeropuertos;
    hotel;
    // traslado;
    toStr = JSON.stringify;
    tipo_tra;
    tipo_viaj;
    dateChekInOut;

    destinoSelected = 0;
    diaServicio;
    diaRegreso;
    locale = 'es';

    require = {
        Errorlugar: false,
        ErrorAero: false,
    }
    constructor(
        private trasladosService: TrasladosService,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private datePipe: DatePipe,
        private trasladosbusqueda: TrasladosComponent,
        private sharedService: SharedService,
        private localeService: BsLocaleService
    ) {
        this.fechaServicio = new Date(Date.now());
        this.localeService.use(this.locale);
        this.meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];


        this.trasladosService.getDestinosTraslado().subscribe(r => {
            this.destinos = r;
        });
    }

    ngOnInit() {
        this.bsConfig = Object.assign({}, { minDate: this.minDate, dateInputFormat: 'MM-DD-YYYY', showWeekNumbers: false, containerClass: 'theme-dark-blue' }); //validacion fecha minima 
        this.datepicker.setConfig(); // asignacion de validacion a daterangepicker
        this.datepickerFR.setConfig(); // asignacion de validacion a daterangepicker

        this.trasladosForm = this.fb.group({
            lugar: ['', Validators.required],
            aeropuerto: ['', Validators.required],
            hotelLabel: ['', Validators.required],
            tipo_viaje: [''],
            tipo_traslado: [''],
            fechaServicio: [''],
            fechaRegreso: [''],
            adultos: [''],
            menores: ['']
        });

        this.sharedService.getParamsBTracitur().subscribe(params_tras => {
            if (params_tras) {
                this.destinoSelected = params_tras.lugar.idDestino; //para seleccionar el option a vista
                this.trasladosForm.controls['lugar'].setValue(params_tras.lugar.idDestino);
                if (params_tras.tipo_viaje == 'one_way') {
                    if (params_tras.tipoTrasladoTransporte == 'AH') {
                        this.aeropuertos = params_tras.lugar.aeropuertos;
                        this.trasladosForm.controls['aeropuerto'].setValue(params_tras.origen.idAeropuerto);
                        this.tipo_tra = 'AH';
                        this.tipo_viaj = 'one_way';
                        this.hotel = params_tras.destino;

                    } else {
                        this.aeropuertos = params_tras.lugar.aeropuertos;
                        this.trasladosForm.controls['aeropuerto'].setValue(params_tras.destino.idAeropuerto);
                        this.tipo_tra = 'HA';
                        this.tipo_viaj = 'one_way';
                        this.hotel = params_tras.origen;
                    }
                } else {
                    this.aeropuertos = params_tras.lugar.aeropuertos;
                    this.trasladosForm.controls['aeropuerto'].setValue(params_tras.origen.idAeropuerto);
                    this.tipo_tra = 'AH';
                    this.tipo_viaj = 'round_trip';
                    this.trasladosForm.controls['tipo_traslado'].disable();
                    this.hotel = params_tras.destino;
                }

                this.trasladosForm.patchValue({
                    tipo_viaje: params_tras.tipo_viaje,
                    tipo_traslado: params_tras.tipoTrasladoTransporte,
                    hotelLabel: params_tras.hotelLabel,
                    adultos: params_tras.adultos,
                    menores: params_tras.menores
                });

                /****************FECHA******************** */
                var final_fecha_fechaRegreso = moment(params_tras.ffinal);
                this.fechaServicio = moment(params_tras.finicio);
                this.fechaRegreso = moment(params_tras.ffinal);

                this.fr_storage = final_fecha_fechaRegreso;
                /****************END FECHA******************** */
            } else {
                this.trasladosForm.patchValue({
                    tipo_viaje: 'one_way',
                    tipo_traslado: 'AH',
                    destino: [],
                    adultos: 1,
                    menores: 0
                });

                this.fechaServicio = new Date();
                this.fechaRegreso = new Date(this.fechaServicio);
                this.fechaRegreso.setDate(this.fechaRegreso.getDate() + 1);

                this.trasladosForm.controls['lugar'].setValue(0);
                this.trasladosForm.controls['aeropuerto'].setValue(0);
                this.trasladosForm.controls['aeropuerto'].disable();
                this.tipo_tra = 'AH';
                this.tipo_viaj = 'one_way';
            }
            this.diaServicio = moment(this.fechaServicio).format("DD");
            this.mesServicio = moment(this.fechaServicio).format("MMM");
            this.anioServicio = moment(this.fechaServicio).format("YYYY");
            this.diaRegreso = moment(this.fechaRegreso).format("DD");
            this.mesRegreso = moment(this.fechaRegreso).format("MMM");
            this.anioRegreso = moment(this.fechaRegreso).format("YYYY");

            var dateService = new Date(this.fechaServicio);
            var dateReturn = new Date(this.fechaRegreso);
            this.trasladosForm.patchValue({ fechaServicio: dateService });
            this.trasladosForm.patchValue({ fechaRegreso: dateReturn });
        });

    }


    get f() { return this.trasladosForm.controls; }

    ChangeFechaServicio(value) {
        this.fechaServicio = new Date(value);
        this.diaServicio = this.fechaServicio.getDate();
        this.mesServicio = this.meses[this.fechaServicio.getMonth()];
        this.anioServicio = this.fechaServicio.getFullYear().toString();

        //calculo previo

        if (this.fr_storage != '') { //valida si existe fecha regreso de storage desde busqueda previa y conserva
            this.fechaRegreso = new Date(this.fechaRegreso);
            this.fechaRegreso.setDate(this.fechaRegreso.getDate());
            this.fr_storage = ''; // inicializa la variable para calcular nueva fecha en caso de cambio de fecha de servicio
        } else { // si no actualiza de la nueva fecha ingresada
            this.fechaRegreso = new Date(value);
            this.fechaRegreso.setDate(this.fechaRegreso.getDate() + 1);
        }

        // this.fechaRegreso = new Date(this.fechaRegreso);

        this.diaRegreso = this.fechaRegreso.getDate();
        this.mesRegreso = this.meses[this.fechaRegreso.getMonth()];
        this.anioRegreso = this.fechaRegreso.getFullYear().toString();
        this.trasladosForm.patchValue({ fechaRegreso: this.fechaRegreso });
        // this.datepickerFR.toggle();
    }

    ChangeFechaRegreso(value) {
        this.fechaRegreso = new Date(value);
        this.diaRegreso = this.fechaRegreso.getDate();
        this.mesRegreso = this.meses[this.fechaRegreso.getMonth()];
        this.anioRegreso = this.fechaRegreso.getFullYear().toString();
    }

    onBuscarTraslado() {
        let data;
        let tt;
        data = this.trasladosForm.value;
        this.submitted = true;
        this.loading = true;

        if (data.lugar == '') {
            this.require.Errorlugar = true;
            this.loading = false;
            return;
        }
        this.require.Errorlugar = false;
        if (data.aeropuerto == '') {
            this.require.ErrorAero = true;
            this.loading = false;
            return;
        }
        this.require.ErrorAero = false;
        if (this.trasladosForm.invalid) {
            this.loading = false;
            return;
        }

        var lugar;
        var aero;
        this.trasladosService.getDestinos().subscribe(r => {
            lugar = r.find(lug => lug.idDestino == data.lugar);
            aero = lugar.aeropuertos.find(areop => areop.idAeropuerto == data.aeropuerto);
        });

        let traslado;
        // return false;
        if (this.trasladosForm.value.tipo_viaje == 'one_way') {
            if (this.trasladosForm.value.tipo_traslado == 'AH') {
                tt = 'aeropuerto';
                traslado = {
                    adultos: data.adultos,
                    destino: this.hotel,
                    finicio: this.datePipe.transform(data.fechaServicio, 'yyyy-MM-dd'),
                    ffinal: this.datePipe.transform(data.fechaRegreso, 'yyyy-MM-dd'),
                    hotelLabel: data.hotelLabel,
                    lugar: lugar,
                    menores: data.menores,
                    origen: aero,
                    tipoTrasladoTransporte: data.tipo_traslado,
                    tipo_traslado: tt,
                    tipo_viaje: data.tipo_viaje
                };
            } else {
                tt = 'hotel';
                traslado = {
                    adultos: data.adultos,
                    destino: aero,
                    // edadmenores: '',
                    finicio: this.datePipe.transform(data.fechaServicio, 'yyyy-MM-dd'),
                    ffinal: this.datePipe.transform(data.fechaRegreso, 'yyyy-MM-dd'),
                    hotelLabel: data.hotelLabel,
                    lugar: lugar,
                    menores: data.menores,
                    origen: this.hotel,
                    tipoTrasladoTransporte: data.tipo_traslado,
                    tipo_traslado: tt,
                    tipo_viaje: data.tipo_viaje
                };
            }
        } else {
            tt = 'aeropuerto';
            traslado = {
                adultos: data.adultos,
                destino: this.hotel,
                finicio: this.datePipe.transform(data.fechaServicio, 'yyyy-MM-dd'),
                ffinal: this.datePipe.transform(data.fechaRegreso, 'yyyy-MM-dd'),
                hotelLabel: data.hotelLabel,
                lugar: lugar,
                menores: data.menores,
                origen: aero,
                tipoTrasladoTransporte: 'AH',
                tipo_traslado: tt,
                tipo_viaje: data.tipo_viaje
            };
        }

        // return false;

        this.sharedService.setParamsBTracitur(traslado);
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/traslados';
        let NavigationExtras: NavigationExtras = {
            state: {
                paramsDispoTras: traslado
            }
        }
        this.router.navigate([this.returnUrl]);
        this.loading = false;
        if (this.router.url == '/traslados') {
            // this.trasladosbusqueda.busquedatraslado();
        } else {
            /* var latitude = parseFloat(this.hotel.geometry.location.lat());
            var longitude = parseFloat(this.hotel.geometry.location.lng());
            this.hotel.geometry.location.lat = latitude;
            this.hotel.geometry.location.lng = longitude;
            this.router.navigate([this.returnUrl], NavigationExtras); */
        }
    }

    public handleAddressChange(address: any) {
        var labelhotel = address.name;
        for (let i = 0; i < address.address_components.length; i++) {
            labelhotel += ', ' + address.address_components[i].long_name;
        }
        this.trasladosForm.patchValue({ hotelLabel: labelhotel });
        this.hotel = {
            address: address.formatted_address,
            geometry: address.geometry,
            name: address.name,
            place_id: address.place_id
        };
    }

    getAirports() {
        var data = this.f.lugar.value;
        let airp;
        this.trasladosService.getDestinos().subscribe(r => {
            airp = r.find(destino => destino.idDestino == data);
        });
        this.trasladosForm.controls['aeropuerto'].enable();
        this.trasladosForm.controls['aeropuerto'].setValue(0);
        this.aeropuertos = airp.aeropuertos;
        this.require.Errorlugar = false;
    }

    changeTipoViaje(ev) {
        this.tipo_viaj = ev.target.value;
        if (this.tipo_viaj == 'round_trip') {
            this.trasladosForm.controls['tipo_traslado'].disable();
            this.trasladosForm.patchValue({ tipo_traslado: 'AH' });
        } else {
            this.trasladosForm.controls['tipo_traslado'].enable();
            this.trasladosForm.patchValue({ tipo_traslado: 'AH' });
            this.tipo_tra = 'AH';
        }
    }

    changeTipoTraslado(tipoTrasladoTransporte) {
        this.tipo_tra = tipoTrasladoTransporte;
    }

    addRemoveAdulto(item, type) {
        switch (type) {
            case "add":
                item += 1;
                break;
            case "rm":
                if (item !== 0) {
                    item -= 1;
                }
                break;
        }
        this.trasladosForm.patchValue({ adultos: item });
    }

    addRemoveMenor(item, type) {
        switch (type) {
            case "add":
                item += 1;
                break;
            case "rm":
                if (item !== 0) {
                    item -= 1;
                }
                break;
        }
        this.trasladosForm.patchValue({ menores: item });
    }

}
