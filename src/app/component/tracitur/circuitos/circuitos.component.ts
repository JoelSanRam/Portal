import { Component, OnInit, Injectable } from '@angular/core';
import {
    TraciturService,
    SharedService,
    FirebaseService,
    AuthenticationService,
    SweetalertService,
} from '@app/services';
import { Router } from '@angular/router';
import { uniq, sortBy } from 'lodash-es';
import { NgxSpinnerService } from "ngx-spinner";
import { TraciturComponent } from '@app/component/tracitur/tracitur.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalFiltersComponent } from '@app/component/tracitur/modal-filters/modal-filters.component';
import { TranslateService } from '@ngx-translate/core';
import { LottieService } from '@app/services/lottie.service';

@Component({
    selector: 'app-circuitos',
    templateUrl: './circuitos.component.html',
    styleUrls: [],
})
@Injectable({
    providedIn: 'root',
})
export class CircuitosComponent implements OnInit {
    paramsCircuitos;
    circuitosResult;
    paramsResult;
    destinoLabel;
    circuitosDisponibles = [];
    circuitosOrderByDate = [];
    catFiltro;
    categoryFilters;
    selectedCategories = [];
    filtrosVarios: FormGroup;
    filorder;
    filservice;

    date;
    notFound = false;
    availableDates = [];

    user;
    currentUser;
    currencies = [];
    ruta;
    today = new Date(Date.now());
    imgruta;
    url_loader;
    constructor(
        private traciturService: TraciturService,
        private sharedService: SharedService,
        private firebaseService: FirebaseService,
        private authenticationService: AuthenticationService,
        private router: Router,
        private swal: SweetalertService,
        private spinnerService: NgxSpinnerService,
        private traciturComponent: TraciturComponent,
        private formBuilder: FormBuilder,
        private modalService: NgbModal,
        private translate: TranslateService,
        private lottieService: LottieService
    ) {
        this.ruta = router.url;
        this.sharedService.usuarioObserver.subscribe((user) => {
            this.user = user;
        });
        this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x));

        this.firebaseService.currencies.subscribe((data) => {
            const currencies = [];
            Object.keys(data).forEach((key) => {
                currencies.push(data[key]);
            });
            this.currencies = currencies;
        });
        this.imgruta='../../../../assets/img/spinners/tarifas.gif?'+this.today;
        this.authenticationService.getLang().subscribe(res=>{
            translate.setDefaultLang(res);
        });
        this.authenticationService.setTypeLoader('defaul');
    }

    ngOnInit() {
        this.authenticationService.getTypeLoader().subscribe((res)=>{
            if(res != undefined){
              this.url_loader = res
            }
          })
        this.showloader();
        this.filtrosVarios = this.formBuilder.group({
            service: [''],
            order: [''],
            brokers: [''],
        });
        this.filtrosVarios.controls['order'].setValue('PRICE_ASC');
        this.paramsCircuitos = JSON.parse(localStorage.getItem('params_circuitos'));
        this.sendRequest(this.paramsCircuitos);
    }

    showloader(){
        if(this.url_loader.existInConfig == false ){
          this.spinnerService.show();
        }else {   
            this.lottieService.setLoader(true, '');
            // console.log(this.url_loader);
          }
      }
    
      hideLoader(){
        
          if( this.url_loader.existInConfig == true ){
              this.lottieService.setLoader(false, '');
          }else {  
              this.spinnerService.hide();
          }
      }

    calculateTDC(tarf, tdc){
        let currency_user = this.user;
        if(tdc === null || tdc == 0){
          var tasaCambioFB = this.currencies.find(function(tc){ return tc.currency_name == currency_user.currency });
          tdc = tasaCambioFB.tasa_cambio;
        }
  
        var total_currency = tarf * tdc;
  
        return total_currency;
    }

    navigateCircuitosResults() {
        this.paramsCircuitos = JSON.parse(localStorage.getItem('params_circuitos'));
        this.sendRequest(this.paramsCircuitos);
        return true;
    }

    sendRequest(params) {
        // this.spinnerService.show();
        this.showloader();
        this.date = params.dt;
        this.traciturService.searchCircuitos(params).subscribe((r) => {
            if (r.results.length === 0) {
                this.notFound = true;
                // this.spinnerService.hide();
                this.hideLoader();
            } else {
                this.notFound = false;
            }
            this.circuitosResult = r.results;
            this.paramsResult = r.searchParameters;
            this.categoryFilters = r.categorias;
            this.circuitosDisponibles = [];
            this.availableDates = [];
            this.circuitosOrderByDate = [];

            for (const circuito of this.circuitosResult) {
                circuito.info.nombre = this.removeAccents(circuito.info.nombre).toUpperCase();
            }

            this.availableDates = this.circuitosResult
                .map((c, i) => c.info.fechaSalida)
                .filter((v, i, a) => a.indexOf(v) === i);

            this.orderByPrice('PRICE_ASC');

            for (const fecha of this.availableDates) {
                this.circuitosDisponibles = this.circuitosResult.filter(
                    (circuito) => circuito.info.fechaSalida === fecha
                );
                this.circuitosOrderByDate.push(this.circuitosDisponibles);
            }
            this.catFiltro = r.categorias;

            // this.spinnerService.hide();
            this.hideLoader();
        });
    }

    removeAccents(value) {
        return value.replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u');
    }

    // FILTROS

    filterByCategory() {
        const modalRef = this.modalService.open(ModalFiltersComponent, {
            size: 'sm',
        });
        modalRef.componentInstance.categories = this.categoryFilters;
        modalRef.componentInstance.selectedCategories = this.selectedCategories;
        modalRef.componentInstance.valueChange.subscribe(($e) => {
            // this.spinnerService.show();
            this.showloader();
            this.selectedCategories = $e;
            const selected = [];
            for (const tour of this.circuitosResult) {
                for (const c of tour.info.categorias) {
                    for (const cSelected of $e) {
                        if (c === cSelected) {
                            selected.push(tour);
                        }
                    }
                }
            }
            this.circuitosDisponibles = uniq(selected, (e) => e);
            let newArray = [];
            this.circuitosOrderByDate = [];
            for (const fecha of this.availableDates) {
                newArray = this.circuitosDisponibles.filter((circuito) => circuito.info.fechaSalida === fecha);
                this.circuitosOrderByDate.push(newArray);
            }
            // this.spinnerService.hide();
            this.hideLoader();
        });
        // this.onSubmit();
    }

    onSubmit() {
        // this.spinnerService.show();
        this.showloader();
        const filorder = this.filtrosVarios.getRawValue().order;
        const filservice = this.filtrosVarios.getRawValue().service;
        this.orderByPrice(filorder);
        this.filterByName(filservice);
    }

    orderByPrice(order) {
        switch (order) {
            case 'PRICE_ASC':
                this.circuitosResult.sort(
                    (a, b) => parseFloat(a.total.publico_currency) - parseFloat(b.total.publico_currency)
                );
                break;
            case 'PRICE_DESC':
                this.circuitosResult.sort(
                    (a, b) => parseFloat(b.total.publico_currency) - parseFloat(a.total.publico_currency)
                );
                break;
        }
        // this.spinnerService.hide();
        this.hideLoader()
    }

    filterByName(val) {
        let newArray = [];
        this.circuitosOrderByDate = [];
        this.circuitosDisponibles = this.circuitosResult.filter((tour) => tour.info.nombre.includes(val.toUpperCase()));
        for (const fecha of this.availableDates) {
            newArray = this.circuitosDisponibles.filter((circuito) => circuito.info.fechaSalida === fecha);
            this.circuitosOrderByDate.push(newArray);
        }
        // this.spinnerService.hide();
        this.hideLoader();
    }

    // ! FILTROS

    checkAvail(book) {
        this.traciturComponent.checkAvail(book);
    }

    gotoBook(book) {
        this.traciturComponent.gotoBook(book, 'circuito');
    }

    showDetails(circuito) {
        this.traciturComponent.showDetails(circuito, this.paramsResult);
    }
}
