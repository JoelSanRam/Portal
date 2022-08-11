import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { Observable, Observer, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
/* import { DatepickerOptions } from 'ng2-datepicker';
import * as esLocale from 'date-fns/locale/es'; */
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TraciturService } from '@app/services';
import { CircuitosComponent } from '@app/component/tracitur/circuitos/circuitos.component';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BsDatepickerDirective, BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
defineLocale('es', esLocale);
import * as moment from 'moment';
import { LottieService } from '@app/services/lottie.service';

@Component({
    selector: 'app-buscador-circuito',
    templateUrl: './buscador-circuito.component.html',
    styleUrls: [],
})
export class BuscadorCircuitoComponent implements OnInit {
    @ViewChild('dpfs', { static: true }) datepicker: BsDatepickerDirective;
    bsConfig: Partial<BsDatepickerConfig>;
    minDate = new Date(Date.now());
    circuitosForm: FormGroup;
    subject: Subject<any> = new Subject();

    showDropDown = false;
    destinos;
    destino;

    numHab = 1;
    habitaciones = [];
    edadMenores = [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
    ];
    personas = 0;

    // DATEPICKER;
    date;
    months: Array<string>;
    day: string;
    month: string;
    year: string;
    today = new Date(Date.now());
    submitted = false;
    loading = false;
    locale = 'es';
    constructor(
        private fb: FormBuilder,
        private traciturService: TraciturService,
        private datePipe: DatePipe,
        private router: Router,
        private circuitosComponent: CircuitosComponent,
        private localeService: BsLocaleService, 
        private lottieService: LottieService,
    ) {
        this.localeService.use(this.locale);
        this.date = new Date(Date.now());
        this.habitaciones = [{ adultos: 2, menores: 0, edadmenores: [] }];
        this.months = [
            'Ene',
            'Feb',
            'Mar',
            'Abr',
            'May',
            'Jun',
            'Jul',
            'Ago',
            'Sep',
            'Oct',
            'Nov',
            'Dic',
        ];
        this.circuitosForm = this.fb.group({
            d: ['', [Validators.required, Validators.minLength(2)]],
            dt: ['', Validators.required],
            ts: [''],
            nhabs: [''],
            habs: [''],
            matchs: [''],
        });
    }

    ngOnInit() {
        this.lottieService.setLoader(false, '');
        //this.bsConfig = Object.assign({}, { minDate: this.minDate, containerClass: 'theme-dark-blue' }); //validacion fecha minima 
        this.bsConfig = Object.assign({}, { minDate: this.minDate, dateInputFormat: 'MM-DD-YYYY', containerClass: 'theme-dark-blue', showWeekNumbers: false }); //validacion fecha minima 
        this.datepicker.setConfig(); // asignacion de validacion a daterangepicker
        if (localStorage.getItem('params_circuitos')) {
            const params = JSON.parse(localStorage.getItem('params_circuitos'));
            this.circuitosForm.patchValue({
                d: params.d,
                ts: 'CIR',
                nhabs: params.nhabs,
                habs: params.habs,
                matchs: params.matchs,
            });
            this.numHab = params.nhabs;
            this.habitaciones = params.habs;


            var fCircuito = moment(params.dt);
            this.date = fCircuito;



        } else {
            this.circuitosForm.patchValue({
                ts: 'CIR',
                nhabs: this.habitaciones.length,
                habs: this.habitaciones,
            });
        }
        // this.changeDate();
        this.day = moment(this.date).format("DD");
        this.month = moment(this.date).format("MMM");
        this.year = moment(this.date).format("YYYY");
        var fecha = new Date(this.date)
        this.circuitosForm.patchValue({ dt: fecha });

        this.calcularTotalPersonas();
        this.destinos = new Observable((observer: Observer<any>) => {
            observer.next(this.f.d.value);
        }).pipe(
            switchMap((query: any) => {
                if (query) {
                    return this.traciturService.autocomplete(query, 'CIR', 'D,S');
                }
                return of([]);
            })
        );
    }

    get f() {
        return this.circuitosForm.controls;
    }

    changeFecha(value) {
        this.date = new Date(value);
        this.day = this.date.getDate().toString();
        this.month = this.months[this.date.getMonth()];
        this.year = this.date.getFullYear().toString();
    }

    onSelect(event: TypeaheadMatch): void {
        this.circuitosForm.patchValue({ d: event.item.label });
        this.circuitosForm.patchValue({ matchs: event.item.matchs });
        this.destino = event.item;
    }

    setIconClass(destino) {
        if (destino.type === 'S') {
            return 'fa-flag';
        } else {
            return 'fa-globe-americas';
        }
    }

    AddRemoveHab(val) {
        switch (val) {
            case 'add':
                if (this.numHab < 9) {
                    this.numHab++;
                    this.habitaciones.push({ adultos: 2, edadmenores: [] });
                    this.calcularTotalPersonas();
                }
                break;
            case 'rm':
                if (this.numHab === 1) {
                } else {
                    this.numHab--;
                    this.habitaciones.splice(-1, 1);
                    this.calcularTotalPersonas();
                }
                break;
        }
    }

    addRemoveAdulto(item, val) {
        const adult = this.habitaciones[item].adultos;
        switch (val) {
            case 'add':
                if (adult < 4) {
                    this.habitaciones[item].adultos++;
                    this.calcularTotalPersonas();
                }
                break;
            case 'rm':
                if (adult === 1) {
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
                    item.edadmenores.push({ edad: 0 });
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
        const adults = this.habitaciones.reduce((a, b) => ({
            adultos: a.adultos + b.adultos,
        }));
        let ninios = 0;
        for (const menor of this.habitaciones) {
            ninios += menor.edadmenores.length;
        }
        this.personas = adults.adultos + ninios;
    }

    searchCircuitos() {
        this.submitted = true;
        if (this.circuitosForm.invalid) {
            return;
        }

        // this.loading = true;
        // this.circuitosForm.value.d = this.destino.label;
        // if (!localStorage.getItem('params_circuitos')) {
        // }
        this.circuitosForm.value.nhabs = this.habitaciones.length;
        this.circuitosForm.value.dt = this.datePipe.transform(
            this.circuitosForm.value.dt,
            'yyyy-MM-dd'
        );
        localStorage.setItem(
            'params_circuitos',
            JSON.stringify(this.circuitosForm.value)
        );
        this.router.navigate(['/circuitos']).then(() => {
            this.loading = false;
            this.circuitosComponent.navigateCircuitosResults();
        });
    }
}
