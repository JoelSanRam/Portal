import { Component, OnInit, Injectable } from '@angular/core';
import {
    TraciturService,
    SharedService,
    FirebaseService,
    AuthenticationService,
    SweetalertService,
} from '@app/services';
import { Router } from '@angular/router';
import { uniq, sortBy, find } from 'lodash-es';
import { TraciturComponent } from '@app/component/tracitur/tracitur.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalFiltersComponent } from '@app/component/tracitur/modal-filters/modal-filters.component';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { LottieService } from '@app/services/lottie.service';
import { AppComponent } from '@app/app.component';
@Component({
    selector: 'app-tours',
    templateUrl: './tours.component.html',
    styleUrls: [],
})
@Injectable({
    providedIn: 'root',
})
export class ToursComponent implements OnInit {
    paramsTours;
    toursResult;
    paramsResult;
    destinoLabel;
    toursDisponibles = [];

    catFiltro;
    categoryFilters;
    selectedCategories = [];
    filtrosVarios: FormGroup;

    notFound = false;

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
        private lottieService: LottieService,
        private appComponent: AppComponent
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
        this.paramsTours = JSON.parse(localStorage.getItem('params_tours'));
        this.sendRequest(this.paramsTours);
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

    calculateTDC(tarf, div, tc=0){
        var divisa = div;
        var total = tarf;
        if(!tc){
          var currency = find(this.currencies, function(current_c){
            return current_c.currency_name == divisa;
          });
          tc = currency.tasa_cambio;
        }
        var total_currency = total * tc;
        return total_currency;
    }

    navigateToursResults() {
        this.paramsTours = JSON.parse(localStorage.getItem('params_tours'));
        this.sendRequest(this.paramsTours);
        return true;
    }

    sendRequest(params) {
        // this.spinnerService.show();
        this.showloader()
        this.traciturService.searchTours(params).subscribe((r) => {
            if (r.results.length === 0) {
                this.notFound = true;
                // this.spinnerService.hide();
                this.hideLoader();
            } else {
                this.notFound = false;
            }
            this.toursResult = r.results;
            this.paramsResult = r.searchParameters;
            // this.destinoLabel = this.paramsTours.d.label;
            this.toursDisponibles = [];

            this.catFiltro = [];

            for (const tour of this.toursResult) {
                const categorias = tour.info.categorias;
                for (const c of categorias) {
                    this.catFiltro.push(c);
                }
                tour.info.nombre = this.removeAccents(tour.info.nombre).toUpperCase();
                this.toursDisponibles.push(tour);
            }
            this.catFiltro = uniq(this.catFiltro, (e) => e);

            // this.obtainFilters(this.catFiltro);

            this.traciturService.filtersNameTours(this.catFiltro).subscribe((categories) => {
                this.categoryFilters = categories;
            });

            this.orderByPrice('PRICE_ASC');
            this.spinnerService.hide();
            this.hideLoader();
        });
    }

    // obtainFilters(params) {
    //     this.traciturService.filtersNameTours(params).subscribe((r) => {
    //         this.categoryFilters = r;
    //     });
    // }

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
            this.selectedCategories = $e;
            const selected = [];
            for (const tour of this.toursResult) {
                for (const c of tour.info.categorias) {
                    for (const cSelected of $e) {
                        if (c === cSelected) {
                            selected.push(tour);
                        }
                    }
                }
            }
            this.toursDisponibles = uniq(selected, (e) => e);
        });
        // this.onSubmit();
    }

    onSubmit() {
        const filorder = this.filtrosVarios.getRawValue().order;
        const filservice = this.filtrosVarios.getRawValue().service;
        this.orderByPrice(filorder);
        this.filterByName(filservice);
    }

    orderByPrice(order) {
        switch (order) {
            case 'PRICE_ASC':
                this.toursResult.sort(
                    (a, b) =>
                        parseFloat(a.tarifas.publica.adulto_currency) - parseFloat(b.tarifas.publica.adulto_currency)
                );
                break;
            case 'PRICE_DESC':
                this.toursResult.sort(
                    (a, b) =>
                        parseFloat(b.tarifas.publica.adulto_currency) - parseFloat(a.tarifas.publica.adulto_currency)
                );
                break;
        }
    }

    filterByName(val) {
        this.toursDisponibles = this.toursResult.filter((tour) => tour.info.nombre.includes(val.toUpperCase()));
    }

    // ! FILTROS

    showDetails(tour) {
        this.traciturComponent.showDetails(tour, this.paramsResult);
    }

    prebookForm(data, pareja) {
        let rangeAdultos_ = [];
        let rangeAdultosMayores = [];
        let rangeInfantes = [];
        let rangeMenores = [];

        let rangeInfantesAges = [];
        let rangeMenoresAges = [];

        const maxAdt = 20;
        const maxAdM = 20;
        const maxInf = 10;
        const maxMen = 10;

        const mayores = data.occupancyRules.mayores;
        const infantes = data.occupancyRules.infantes;
        const menores = data.occupancyRules.menores;
        const ocupmin = data.occupancyRules.ocupmin;

        const minAdt =
            typeof data.occupancyRules.ocupmin !== 'undefined'
                ? data.occupancyRules.mayores === '1'
                    ? 0
                    : ocupmin
                : 1;
        const minRangeInf = data.occupancyRules.edadinfantemin;
        const maxRangeInf = data.occupancyRules.edadinfantemax;
        const minRangeMen = data.occupancyRules.edadmenormin;
        const maxRangeMen = data.occupancyRules.edadmenormax;
        let agesRanges = [];

        for (let i = minAdt; i <= maxAdt; i++) {
            rangeAdultos_.push(i.toString());
            if (pareja === 1) {
                var $arrayPares = [];
                $arrayPares = this.obtenerPares(rangeAdultos_);
            }
        }
        for (let i = 0; i <= maxAdM; i++) {
            rangeAdultosMayores.push(i.toString());
        }
        for (let i = 0; i <= maxInf; i++) {
            rangeInfantes.push(i.toString());
        }
        for (let i = 0; i <= maxMen; i++) {
            rangeMenores.push(i.toString());
        }
        for (let i = parseInt(minRangeInf); i <= parseInt(maxRangeMen); i++) {
            rangeInfantesAges.push(i.toString());
        }
        for (let i = parseInt(minRangeMen); i <= parseInt(maxRangeMen); i++) {
            rangeMenoresAges.push(i.toString());
        }
        if (typeof data.ocupacion !== 'undefined') {
            var ocupacionAdultos = data.ocupacion.adultos;
            var ocupacionMenores = data.ocupacion.menores;
        } else {
            ocupacionMenores = 0;
        }

        let rangeAdultos = [];

        if (pareja === 1) {
            rangeAdultos = $arrayPares;
        } else {
            rangeAdultos = rangeAdultos_;
        }

        const ocupancyOptions = {
            ocupmin: typeof data.ocupmin !== 'undefined' ? data.ocupmin : 1,
            adultos: {
                options: rangeAdultos,
            },
            mayores: {
                active: mayores,
                options: rangeAdultosMayores,
            },
            infantes: {
                active: infantes,
                options: rangeInfantes,
                option_ages: rangeInfantesAges,
            },
            menores: {
                active: menores,
                options: rangeMenores,
                optionas_ages: rangeMenoresAges,
            },
            typePax: 0,
        };

        let typePax = 1;
        if (ocupancyOptions.mayores.active == 1) {
            typePax += 1;
        }
        if (ocupancyOptions.infantes.active == 1) {
            typePax += 1;
        }
        if (ocupancyOptions.menores.active == 1) {
            typePax += 1;
        }

        ocupancyOptions.typePax = typePax; 

        data.book = {
            info: data.info,
            politicas: data.politicas,
            consumer:data.consumer,
            wholesaler: data.wholesaler,
            rooming: {
                adultos: typeof data.ocupacion !== 'undefined' ? ocupacionAdultos : ocupmin,
                mayores: '0',
                infantes: '0',
                menores: ocupacionMenores,
            },
            ocupancyOptions: ocupancyOptions,
            tarifas: data.tarifas,
            total: {
                currency: data.tarifas.currency,
                neto: 0,
                publico: 0,
            },
        };

        data.prebook = !data.prebook;
        this.calculateTotal(data.book);
    }

    obtenerPares(num) {
        let arrayPar = [];
        for (var i = 2; i <= num.length; i++) {
            if (i % 2 === 0) {
                arrayPar.push(i.toString());
            }
        }
        return arrayPar;
    }

    calculateTotal(book) {
        let adultoMayorActive = book.ocupancyOptions.mayores.active;
        let infantesActive = book.ocupancyOptions.infantes.active;
        let menoresActive = book.ocupancyOptions.menores.active;

        let tarifas = book.tarifas.publica;
        let tarifasNetas = book.tarifas.neta;

        let nAdultos = parseInt(book.rooming.adultos);
        let nMayores = parseInt(book.rooming.mayores);
        let nInfantes = parseInt(book.rooming.infantes);
        let nMenores = parseInt(book.rooming.menores);

        let pAdulto = tarifas.adulto;
        let pAdultoMayor = tarifas.mayor;
        let pInfante = tarifas.infante;
        let pMenor = tarifas.menor;

        let pnAdulto = tarifasNetas.adulto;
        let pnAdultoMayor = tarifasNetas.mayor;
        let pnInfante = tarifasNetas.infante;
        let pnMenor = tarifasNetas.menor;

        let total = 0;
        let totalNeto = 0;

        let impAdultos = 0;
        let impMayores = 0;
        let impInfantes = 0;
        let impMenores = 0;

        let impNAdultos = 0;
        let impNMayores = 0;
        let impNInfantes = 0;
        let impNMenores = 0;
        const ratesDetails = [
            {
                adultos: {
                    cantidad: nAdultos,
                    importen: 0,
                    importep: 0,
                },
                adultosmayores: {
                    cantidad: pnAdultoMayor,
                    importen: 0,
                    importep: 0,
                },
                infantes: {
                    cantidad: pnInfante,
                    importen: 0,
                    importep: 0,
                },
                menores: {
                    cantidad: pnMenor,
                    importen: 0,
                    importep: 0,
                },
            },
        ];

        if (adultoMayorActive === 1) {
            impNMayores = nMayores * pnAdultoMayor;
            impMayores = nMayores * pAdultoMayor;

            ratesDetails[0].adultosmayores.importen = impNMayores;
            ratesDetails[0].adultosmayores.importep = impMayores;
        }
        if (infantesActive === 1) {
            impNInfantes = nInfantes * pnInfante;
            impInfantes = nInfantes * pInfante;

            ratesDetails[0].infantes.importen = impNInfantes;
            ratesDetails[0].infantes.importep = impInfantes;
        }
        if (menoresActive === 1) {
            impNMenores = nMenores * pnMenor;
            impMenores = nMenores * pMenor;

            ratesDetails[0].menores.importen = impNMenores;
            ratesDetails[0].menores.importep = impMenores;
        }
        impNAdultos = nAdultos * pnAdulto;
        impAdultos = nAdultos * pAdulto;

        ratesDetails[0].adultos.importen = impNAdultos;
        ratesDetails[0].adultos.importep = impAdultos;

        total = impAdultos + impMayores + impInfantes + impMenores;
        totalNeto = impNAdultos + impNMayores + impNInfantes + impNMenores;
        if (total > 0) {
            book.available = true;
        } else {
            book.available = false;
        }

        book.ratesDetails = ratesDetails;
        book.total.neto = totalNeto;
        book.total.publico = total;
    }

    gotoBook(book) {
        this.traciturComponent.gotoBook(book, 'tour');
    }
}
