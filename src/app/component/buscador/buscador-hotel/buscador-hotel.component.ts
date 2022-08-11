import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HotelService, AlertService, FocusService, SharedService, SweetalertService, ConfigService } from "@app/services";
import { DatePipe } from "@angular/common";
import { HotelesComponent } from "../../hoteles/hoteles.component";
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { Observable, Observer, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { BsDaterangepickerDirective, BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import * as moment from 'moment';
import * as lodash from "lodash";
import { TranslateService } from '@ngx-translate/core';
import {data} from './Arraybrokers'
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

defineLocale('es', esLocale);

@Component({
    selector: 'app-buscador-hotel',
    templateUrl: './buscador-hotel.component.html',
    styleUrls: []
})
export class BuscadorHotelComponent implements OnInit {
    @ViewChild('drp', { static: true }) datepicker: BsDaterangepickerDirective;
    bsConfig: Partial<BsDatepickerConfig>;
    minDate = new Date();
    toStr = JSON.stringify;
    srchHotelForm: FormGroup;
    submitted = false;
    encrypbusqueda;
    loading = false;
    returnUrl: string;
    numHab: number; //numero de habitacion
    dateIn;   //-Check In
    dateOut; //-Check Out
    meses: Array<string>;
    mesIn: string;
    mesOut: string;
    anioIn: string;
    anioOut: string;
    habitaciones = [];
    destinos;
    destino = {};
    personas = 0;
    dateChekInOut;
    edadMenores = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    despliegue = false;
    nacionalidadesList = [];
    activeRoute = this.router.url;
    innerWidth = window.innerWidth;
    @ViewChild('dropdownMenuButton', { static: true }) dropdownMenuButton: ElementRef<HTMLElement>;
    noResult = false; //typehead
    locale = 'es';
    dayIn;
    dayOut;

    dropdownSettings: NgMultiSelectDropDownModule;
    status = [];
    statusSelected = [];
    mostrarPP:boolean = false;
    checkPP:boolean = false;

    idOperador = ConfigService.configFile.idOperador;

    validDate: boolean = false;
    @Output() itemsBusqueda = new EventEmitter<{}>();
    constructor(
        private formBuilder: FormBuilder,
        private hotelService: HotelService,
        private alertService: AlertService,
        private sharedService: SharedService,
        private datePipe: DatePipe,
        private route: ActivatedRoute,
        private router: Router,
        private hotelesbusqueda: HotelesComponent,
        private focusService: FocusService,
        private localeService: BsLocaleService,
        private activatedRoute: ActivatedRoute,
        public sweetAlertService: SweetalertService,
        private translate: TranslateService
    ) {
        this.numHab = 1;
        this.habitaciones = [{ 'adultos': 2, 'menores': 0, 'edadmenores': [] }];
        this.meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      
        this.localeService.use(this.locale);
        
    }

    ngOnInit() {

        this.bsConfig = Object.assign({}, { dateInputFormat: 'YYYY-MM-DD', containerClass: 'theme-dark-blue', showWeekNumbers: false, preventChangeToNextMonth: true }); //validacion fecha minima 
        this.datepicker.setConfig(); // asignacion de validacion a daterangepicker

        this.srchHotelForm = this.formBuilder.group({
            destino: ['', Validators.required],
            dateInOut: ['', Validators.required],
            nacionalidad: ['', Validators.required]
        });
        this.getNacionalidades();

        this.activatedRoute.queryParams.subscribe(params => {
            console.log("aaaaa",params)
            if (Object.keys(params).length === 0) {
                // SIN PARAMETROS

                this.dateIn = moment();
                this.dateOut = moment().add(2, 'day');
            } else {
                let nacionalidad = JSON.parse(params.nacionalidad)
                this.habitaciones = JSON.parse(params.habs);
                this.numHab = this.habitaciones.length;
                this.destino = {
                    Label: decodeURI(params.label),
                    nombre: decodeURI(params.nombre),
                    idDest: params.idDest,
                    pais: decodeURI(params.pais),
                    id: params.id,
                    Type: params.type
                };
                const e=JSON.parse(params?.filters);

                if(e?.brokers.length >0){
                    this.checkPP=true
                }
                this.srchHotelForm.patchValue({ destino: decodeURI(params.label) });
                this.srchHotelForm.controls['nacionalidad'].setValue(nacionalidad.code);

                this.dateIn = moment(params.finicio);
                this.dateOut = moment(params.ffinal);
            }
        })
        this.statusSelected=[]

        this.dayIn  = moment(this.dateIn).format('DD');
        this.mesIn  = moment(this.dateIn).format('MMM');
        this.anioIn = moment(this.dateIn).format('YYYY');
        this.dayOut     = moment(this.dateOut).format('DD');
        this.mesOut     = moment(this.dateOut).format('MMM');
        this.anioOut    = moment(this.dateOut).format('YYYY');


        var fechaIn = new Date(this.dateIn);
        var fechaOut = new Date(this.dateOut);
        var currentDateRange = [fechaIn,fechaOut];
        this.srchHotelForm.patchValue({ dateInOut: currentDateRange });
        this.calcularTotalPersonas();

        this.dropdownSettings = {
            singleSelection: false,
            idField: 'idbroker',
            textField: 'nombre',
            selectAllText: 'Seleccionar todos',
            unSelectAllText: 'Deseleccionar todos',
            itemsShowLimit: 1,
            allowSearchFilter: false
        };

        this.status = data;

        this.destinos = new Observable((observer: Observer<any>) => {
            observer.next(this.f.destino.value);
        }).pipe(
            switchMap((query: any) => {
                if (query) {
                    return this.hotelService.getDestinoHotel(query);
                }
                return of([]);
            })
        );
    }

    clickCheck(){
        this.checkPP=!this.checkPP;
        if( this.checkPP)
        { 
            this.statusSelected.push('OMBE');
            this.statusSelected.push('DING')
        }else{
            this.statusSelected=[]
        }
    }
    onItemSelect(item: any) {
        this.statusSelected.push(item.nombre);
    }

    onSelectAll(items: any) {
        const [nombre]={...data}
        console.log("nombre",nombre)
       
        this.statusSelected ={...data};
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

    onValueChange(value:Date){
        var title;
		this.translate.get('hotel.fechas-invalidas').subscribe((data: any) => { title = data; });

        this.dateIn = moment(value[0]);
        this.dateOut = moment(value[1]);

        //Validar fecha regreso no sea el mismo día
        
        if(moment(this.dateIn).isSame(this.dateOut,'day')){
            this.sweetAlertService.info(title, 'No es posible buscar disponibilidades con las mismas fechas');
            this.dateOut= moment(this.dateOut).add(2, 'day');

            var fechaIn = new Date(this.dateIn);
            var fechaOut = new Date(this.dateOut);
            var currentDateRange = [fechaIn,fechaOut];
            this.srchHotelForm.patchValue({ dateInOut: currentDateRange });
        }

        this.dayIn      = moment(this.dateIn).format('DD');
        this.mesIn      = moment(this.dateIn).format('MMM');
        this.anioIn     = moment(this.dateIn).format('YYYY');
        this.dayOut     = moment(this.dateOut).format('DD');
        this.mesOut     = moment(this.dateOut).format('MMM');
        this.anioOut    = moment(this.dateOut).format('YYYY');
    }

    get f() { return this.srchHotelForm.controls; }

    showPP():void{
        this.mostrarPP=!this.mostrarPP;
    }
    onSelect(event: TypeaheadMatch): void {
        this.srchHotelForm.patchValue({ destino: event.item.Label });
        this.destino = event.item;

        this.openStartDate();
    }

    handler(value) {
        if (value == 'onShow') {
            this.setFocus1('next');
        }
        if (value == 'onHidden') {
            let statusFocus1 = this.focusService.getFocus1();
            if (statusFocus1) {
                this.openDropDownHabs();
            }
        }
    }

    openStartDate() {
        setTimeout(() => {
            this.datepicker.show();
        }, 100);
    }

    openDropDownHabs() {
        let el: HTMLElement = this.dropdownMenuButton.nativeElement;
        setTimeout(() => {
            el.click();
        }, 100);
    }

    setFocus1(validacion) {
        if (validacion == 'next') {
            this.focusService.setFocus1(true);
        }
    }

    AddRemoveHab(val) {
        switch (val) {
            case 'add':
                if (this.numHab < 8) {
                    this.numHab++;
                    this.habitaciones.push({ 'adultos': 2, 'edadmenores': [], 'menores': 0 });
                    this.calcularTotalPersonas();
                }
                break;
            case 'rm':
                if (this.numHab == 1) {
                } else {
                    this.numHab--;
                    this.habitaciones.splice(-1, 1);
                    this.calcularTotalPersonas();
                }
                break;
        }
    }

    addRemoveAdulto(item, val) {
        let adult = this.habitaciones[item].adultos;
        switch (val) {
            case 'add':
                if (adult < 5) {
                    this.habitaciones[item].adultos++;
                    this.calcularTotalPersonas();
                }
                break;
            case 'rm':
                if (adult == 1) {
                } else {
                    this.habitaciones[item].adultos--;
                    this.calcularTotalPersonas();
                }
                break;
        }
    }

    addRemoveMenor(item, val) {
        switch (val) {
            case 'add':
                if (item.edadmenores.length < 3) {
                    item.edadmenores.push({ 'edad': 0 });
                    item.menores = item.edadmenores.length;
                    this.calcularTotalPersonas();
                }
                break;
            case 'rm':
                item.edadmenores.pop();
                item.menores = item.edadmenores.length;
                this.calcularTotalPersonas();
                break;
        }
    }

    edadMenor(indexHab, indexEdadmenores, value) {
        this.habitaciones[indexHab].edadmenores[indexEdadmenores].edad = value;
    }

    calcularTotalPersonas() {
        var adults = this.habitaciones.reduce((a, b) => ({ adultos: a.adultos + b.adultos }));
        var ninios = 0;
        for (var menor of this.habitaciones) {
            ninios += menor.edadmenores.length;
        }
        this.personas = adults.adultos + ninios;
    }

    getNacionalidades() {
        this.hotelService.getNacionalidades().subscribe((res) => {
            this.nacionalidadesList = res;
            let defaultNatiolalite = lodash.first(res);
            this.srchHotelForm.controls['nacionalidad'].setValue(defaultNatiolalite.code);
        });
    }

    onBuscarHotel() {
        this.submitted = true;
        //VALIDADORES
        this.loading = true;
        if (this.srchHotelForm.invalid) {
            this.loading = false;
            return;
        }

        let nacionalidadSelected = this.srchHotelForm.value.nacionalidad;
        let nacionalidadObj = this.nacionalidadesList.find(function (n) {
            if (n.code == nacionalidadSelected) {
                return n;
            }
        });

        let paramsBusqueda = {
            destino: this.destino,
            ffinal:  moment(this.dateOut).format('YYYY-MM-DD'),
            finicio: moment(this.dateIn).format('YYYY-MM-DD'),
            habitaciones: this.habitaciones,
            nhabs: this.habitaciones.length,
            // planalimentos: 6,
            sortOrder: "PRICE_ASC",
            nacionalidad: nacionalidadObj,
            filters:{
                brokers:this.statusSelected
            }
        };

        let setParamsUrl = {
            label: encodeURI(this.destino['Label']),
            type: this.destino['Type'],
            id: this.destino['id'],
            idDest: this.destino['idDest'],
            nombre: encodeURI(this.destino['nombre']),
            pais: encodeURI(this.destino['pais']),
            ffinal:  moment(this.dateOut).format('YYYY-MM-DD'),
            finicio: moment(this.dateIn).format('YYYY-MM-DD'),
            habs: JSON.stringify(this.habitaciones),
            nacionalidad: JSON.stringify(nacionalidadObj),
            filters:JSON.stringify({
                brokers:this.statusSelected
            })
        };
        

        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/hoteles';
        this.loading = false;
        this.router.navigate([this.returnUrl], { queryParams: setParamsUrl });
        this.itemsBusqueda.emit(paramsBusqueda);
        this.hotelService.setBtnSearch(true);

    }
}
