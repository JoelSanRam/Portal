import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges, OnChanges, QueryList, ElementRef, ViewChildren } from '@angular/core';
import { AereosService } from '@app/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-filtros-aereos',
    templateUrl: './filtros-aereos.component.html',
})
export class FiltrosAereosComponent implements OnInit, OnChanges {
    @Input() filtros: any;
    @Input() selectedFilters: any;
    @Input() tipoVuelo;
    @Output() filtersEvent = new EventEmitter<any>();
    @Input() showFilters: boolean = false;
    @Output() modalfilters = new EventEmitter<any>();
    newFilters: { ordenar: string, aerolinea: Array<string>, escalas: Array<string>, horarios: Object, duracion: Array<number>, precio: Array<number> } = {
        ordenar: '',
        aerolinea: [],
        escalas: [],
        horarios: {},
        duracion: [],
        precio: []
    };
    @ViewChildren("airlineCheckboxes") airlineCheckboxes: QueryList<ElementRef>
    @ViewChildren("stopsCheckboxes") stopsCheckboxes: QueryList<ElementRef>
    @ViewChildren("scheduleCheckboxes") scheduleCheckboxes: QueryList<ElementRef>

    filComplete = {};
    horariosCheck;
    labelTypeFlight;
    constructor(
        private aereosService: AereosService,
        private translate: TranslateService,
    ) { }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.aereosService.getSelectedFilters$().subscribe(resp => {
            this.newFilters = resp;
        })
        // this.newFilters = this.selectedFilters;
        if (typeof this.newFilters.aerolinea === 'undefined') {

        }
        if (this.newFilters.aerolinea?.length === 0) {
            this.airlineCheckboxes?.forEach((element) => {
                element.nativeElement.checked = false;
            });
        }
        if (this.newFilters.escalas?.length === 0) {
            this.stopsCheckboxes?.forEach((element) => {
                element.nativeElement.checked = false;
            });
        }
        /* if (this.newFilters.horarios?.length === 0) {
            this.scheduleCheckboxes?.forEach((element) => {
                element.nativeElement.checked = false;
            });
        } */

        if (typeof this.filtros !== 'undefined') {
            var horariosAplicados;
            if (Object.keys(this.newFilters.horarios).length === 0) {
                horariosAplicados = {};
                this.filComplete = {};
            } else {
                horariosAplicados = this.newFilters.horarios;
            }
            this.checkboxHours(this.filtros.horarios, horariosAplicados)
        }
    }

    selectOrder(event) {
        const value = event.target.value;
        this.newFilters.ordenar = value;
        if (!this.showFilters) {
            this.sendFilters();
        }
    }

    selectAirline(event) {
        const value = event.target.value;
        const checked = event.target.checked;
        if (this.newFilters.aerolinea === undefined) {
            this.newFilters.aerolinea = []
        }
        if (checked) {
            this.newFilters.aerolinea.push(value);
        } else {
            const index = this.newFilters.aerolinea.indexOf(value);
            this.newFilters.aerolinea.splice(index, 1);
        }
        if (!this.showFilters) {
            this.sendFilters();
        }
    }

    selectStop(event) {
        const value = event.target.value;
        const checked = event.target.checked;
        if (this.newFilters.escalas === undefined) {
            this.newFilters.escalas = []
        }
        if (checked) {
            this.newFilters.escalas.push(value);
        } else {
            const index = this.newFilters.escalas.indexOf(value);
            this.newFilters.escalas.splice(index, 1);
        }
        if (!this.showFilters) {
            this.sendFilters();
        }
    }

    selectSchedule(event, index, length) {
        const value = event.target.value;
        const checked = event.target.checked;
        const i = index;
        this.newFilters.horarios = {};
        if (this.newFilters.horarios === undefined) {
            this.filComplete = {}
        }
        if (checked) {
            if (typeof this.filComplete[index] === 'undefined') {
                this.filComplete[i] = [];
                this.filComplete[i].push(value);
            } else {
                this.filComplete[i].push(value);
            }
        } else {
            const indx = this.filComplete[i].indexOf(value);
            this.filComplete[i].splice(indx, 1);
        }
        this.newFilters.horarios = this.filComplete;
        if (!this.showFilters) {
            // this.aereosService.setSelectedFilters(this.newFilters);
            this.sendFilters();
        }
    }

    selectDuration(event, index) {
        const value = event.target.valueAsNumber;
        this.newFilters.duracion[index] = value
        if (!this.showFilters) {
            this.sendFilters();
        }
    }

    selectPrice(event) {
        const value = event.target.valueAsNumber;
        this.newFilters.precio = []
        this.newFilters.precio.push(value);
        if (!this.showFilters) {
            this.sendFilters();
        }
    }

    // Enviar filtros seleccionados al componente padre
    sendFilters() {
        // Eliminar las propiedades vacías
        Object.keys(this.newFilters).forEach((k) => this.newFilters[k].length === 0 ? delete this.newFilters[k] : this.newFilters[k]);
        this.filtersEvent.emit(this.newFilters);
        if (this.showFilters) {
            this.closeModal();
        }
    }

    closeModal() {
        this.modalfilters.emit(false);
    }

    checkboxHours(filtros, selectedFilters) {
        var array = []
        var maniana;
        var tarde;
        var noche;
        this.translate.get('vuelos.maniana').subscribe((data: any) => { maniana = data; });
        this.translate.get('vuelos.tarde').subscribe((data: any) => { tarde = data; });
        this.translate.get('vuelos.noche').subscribe((data: any) => { noche = data; });
        filtros.map(filtro => {
            array.push([
                { type: 'man', label: maniana, counter: filtro.man, rangeTime: '05:00-12:59', checked: false },
                { type: 'tarde', label: tarde, counter: filtro.tarde, rangeTime: '13:00-19:59', checked: false },
                { type: 'noche', label: noche, counter: filtro.noche, rangeTime: '20:00-04:59', checked: false },
            ])
        });

        array.map((item, indice) => {
            item.map(nodo => {
                var label = nodo.label
                if (typeof selectedFilters[indice] === 'undefined') { } else {
                    if (selectedFilters[indice].includes(label)) {
                        nodo.checked = true;
                    }
                }
            })
        })
        this.horariosCheck = array;
    }

    showLabelSchedule(index) {
        var salidaTramo;
        var salida;
        this.translate.get('vuelos.salida-tramo').subscribe((data: any) => { salidaTramo = data; });
        this.translate.get('vuelos.salida').subscribe((data: any) => { salida = data; });
        if (this.tipoVuelo == 'roundtrip') {
            if (index == 0) { return 'salida' } else { return 'regreso' };
        }
        if (this.tipoVuelo == 'multitrip') {
            return salidaTramo + (index + 1);
        } else {
            return salida;
        }

    }

}
