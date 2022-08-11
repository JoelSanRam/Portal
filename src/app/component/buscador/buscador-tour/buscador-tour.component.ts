import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { Observable, Observer, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TraciturService } from '@app/services';
/* import { DatepickerOptions } from 'ng2-datepicker';
import * as esLocale from 'date-fns/locale/es'; */
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ToursComponent } from '@app/component/tracitur/tours/tours.component';
import { BsDatepickerDirective, BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import * as moment from 'moment';
defineLocale('es', esLocale);

@Component({
    selector: 'app-buscador-tour',
    templateUrl: './buscador-tour.component.html',
    styleUrls: [],
})
export class BuscadorTourComponent implements OnInit {
    @ViewChild('dpft', { static: true }) datepicker: BsDatepickerDirective;
    bsConfig: Partial<BsDatepickerConfig>;
    minDate = new Date(Date.now());
    toursForm: FormGroup;
    showDropDown = false;
    destinos;
    destino;

    // DATEPICKER;
    date;
    months: Array<string>;
    day : string;
    month: string;
    year: string;
    today = new Date(Date.now());
    /* options: DatepickerOptions = {
        minYear: this.today.getFullYear(),
        maxYear: this.today.getFullYear() + 10,
        displayFormat: 'DD',
        barTitleFormat: 'MMMM YYYY',
        dayNamesFormat: 'dd',
        firstCalendarDay: 0, // 0 - Sunday, 1 - Monday
        locale: esLocale,
        minDate: new Date(Date.now()),
        addStyle: {
            width: '1.3em',
            padding: '0',
            'font-size': '2.3em',
            cursor: 'pointer',
            border: 'unset',
            color: 'unset',
            'background-color': 'unset',
        },
        useEmptyBarTitle: false,
    }; */

    submitted = false;
    loading = false;
    locale = 'es';
    constructor(
        private fb: FormBuilder,
        private traciturService: TraciturService,
        private datePipe: DatePipe,
        private router: Router,
        private toursComponent: ToursComponent,
        private localeService : BsLocaleService
    ) {
        this.localeService.use(this.locale);
        this.date = new Date(Date.now());
        this.months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        this.toursForm = this.fb.group({
            destino: ['', Validators.required],
            typeDes: [''],
            d: [''],
            s: [''],
            dt: ['', Validators.required],
            ts: [''],
            ocupacion: [''],
            adultos: [''],
            menores: [''],
        });
    }

    ngOnInit() {
        //this.bsConfig = Object.assign({}, { minDate: this.minDate, containerClass: 'theme-dark-blue' }); //validacion fecha minima 
        this.bsConfig = Object.assign({}, { minDate: this.minDate, dateInputFormat: 'MM-DD-YYYY', containerClass: 'theme-dark-blue', showWeekNumbers: false  }); //validacion fecha minima 
        this.datepicker.setConfig(); // asignacion de validacion a daterangepicker
        if (localStorage.getItem('params_tours')) {
            const params = JSON.parse(localStorage.getItem('params_tours'));
            this.toursForm.patchValue({
                destino: params.destino,
                typeDes: params.typeDes,
                d: params.d,
                s: params.s,
                // dt: params.dt,
                ts: 'TOU',
                ocupacion: params.ocupacion,
                adultos: params.adultos,
                menores: params.menores,
            });

            
            // var fTour = this.datePipe.transform(params.dt, 'd MMM y');
            var fTour = moment(params.dt);
           
           /*  this.date = new Date(params.dt); */
            // this.date = new Date(fTour);
            this.date = fTour;
           
           /*  this.date.setDate(this.date.getDate()+1); */
        } else {
            // this.day = this.date.getDate().toString();
            this.toursForm.patchValue({
                d: undefined,
                s: undefined,
                // dt: this.date,
                ts: 'TOU',
                ocupacion: 0,
                adultos: 0,
                menores: 0,
            });
        }

        this.day = moment(this.date).format("DD");
        this.month = moment(this.date).format("MMM");
        this.year = moment(this.date).format("YYYY");

        var fecha = new Date(this.date)
        this.toursForm.patchValue({dt:fecha});
        // this.changeFecha(this.date);

        this.destinos = new Observable((observer: Observer<any>) => {
            observer.next(this.f.destino.value);
        }).pipe(
            switchMap((query: any) => {
                if (query) {
                    return this.traciturService.autocomplete(query, 'TOU', 'D,S');
                }
                return of([]);
            })
        );
    }

    get f() {
        return this.toursForm.controls;
    }

    changeFecha(value){
        this.date = new Date(value);
        this.day = this.date.getDate().toString();
        this.month = this.months[this.date.getMonth()].toString();
        this.year = this.date.getFullYear().toString();
    }

    onSelect(event: TypeaheadMatch): void {
        this.toursForm.patchValue({ 
            destino: event.item.label,
            typeDes: event.item.type
        });
        this.destino = event.item;
    }

    setIconClass(destino) {
        if (destino.type === 'S') {
            return 'fa-flag';
        } else {
            return 'fa-globe-americas';
        }
    }

    addRemoveAdulto(item, type) {
        switch (type) {
            case 'add':
                item += 1;
                break;
            case 'rm':
                if (item !== 0) {
                    item -= 1;
                }
                break;
        }
        this.toursForm.patchValue({ adultos: item });
    }

    addRemoveMenor(item, type) {
        switch (type) {
            case 'add':
                item += 1;
                break;
            case 'rm':
                if (item !== 0) {
                    item -= 1;
                }
                break;
        }
        this.toursForm.patchValue({ menores: item });
    }

    searchTour() {
        this.submitted = true;
        if (this.toursForm.invalid) {
            return;
        }
        // Delete results

        // this.loading = true;
        if (this.toursForm.value.ocupacion) {
            this.toursForm.patchValue({
                ocupacion: 1,
            });
        } else {
            this.toursForm.patchValue({
                ocupacion: 0,
                adultos: 0,
                manores: 0,
            });
        }
        if (this.f.destino.touched) {
            if (this.toursForm.value.typeDes === 'S') {
                this.toursForm.value.s = this.destino.label;
                this.toursForm.value.d = undefined;
            } else {
                this.toursForm.value.s = undefined;
                this.toursForm.value.d = this.destino.label;
            }
        }
        this.toursForm.value.dt = this.datePipe.transform(this.toursForm.value.dt, 'yyyy-MM-dd');
        localStorage.setItem('params_tours', JSON.stringify(this.toursForm.value));
        this.router.navigate(['/tours']).then(() => {
            this.loading = false;
            this.toursComponent.navigateToursResults();
        });
    }
}
