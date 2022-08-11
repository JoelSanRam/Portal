import { Component, OnInit } from '@angular/core';
import { AuthenticationService, ConfigService, CotizacionesService, SharedService, SweetalertService } from "@app/services";
import { Router, NavigationExtras } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { FirebaseService } from '@app/services/firebase/firebase.service';
import { TranslateService } from '@ngx-translate/core';
import { LottieService } from '@app/services/lottie.service';
import { AppComponent } from '@app/app.component';


@Component({
    selector: 'app-cotizaciones',
    templateUrl: './cotizaciones.component.html',
    styleUrls: []
})
export class CotizacionesComponent implements OnInit {
    historial: any = [];
    cotizaciones: any = [];
    all: any;
    allHistorial: any;
    cotizaciones_novistas;
    isDisabled = true;
    isDisabledH = true;
    selected = [];
    limitResult = 5;
    user;
    today = new Date(Date.now());
    imgruta;
    currencies = [];
    page = 1;
    sizePage = 25;
    sizePageC = 25;
    paginacion;
    paginacionC;
    url_loader;
    anuncios = ConfigService.configFile.anuncios;
    idOperador = ConfigService.configFile.idOperador;
    anuncio1;
    link1;
    idOpe;
    currentUser;
    constructor(
        private cotizacionesService: CotizacionesService,
        private swal: SweetalertService,
        private fs: FirebaseService,
        private router: Router,
        public sharedService: SharedService,
        private spinnerService: NgxSpinnerService,
        private lottieService: LottieService,
        private appComponent: AppComponent,
        private auth: AuthenticationService,
        private translate: TranslateService
    ) {
        this.sharedService.usuarioObserver.subscribe(user => {
            this.user = user;
        });
        this.imgruta = './assets/img/spinners/general.gif?'+this.today;

        this.fs.currencies.subscribe(data => {
            var curr = [];
            Object.keys(data).forEach(function (key) {
                curr.push(data[key]);
            });
            this.currencies = curr;
        });

        this.auth.getLang().subscribe(res=>{
            translate.setDefaultLang(res);
        });
        this.auth.setTypeLoader('defaul');
        this.auth.currentUser.subscribe(x => this.currentUser = x);
        this.idOpe = this.currentUser.userData.idOperador;
    }

    ngOnInit() {
        this.auth.getTypeLoader().subscribe((res)=>{
            if(res != undefined){
              this.url_loader = res
            }
          })
        this.getHistorial();
        this.getCotizaciones();
        this.visto();
        this.showloader();
        // console.log(this.appComponent.title);
        var operador;
        if(
            this.idOperador == "AZAMID" && this.idOpe == "AZAMID" ||
            this.idOperador == "AZAMID" && this.idOpe == "AZAMTY" ||
            this.idOperador == "AZAMID" && this.idOpe == "AZAMX"
        ){
            operador = "AZAMID";
            this.link1 = ConfigService.configFile.anuncios[operador].principal;
            this.anuncio1 = './assets/img/anuncio1_'+operador+'.jpg';
        }else if( 
            (
                this.idOperador == "AZABR" && this.idOpe == "AZABR"
            ) || this.idOpe == "AZABR" || this.idOpe == "AZALTM"  || this.idOpe == "AZACR" || this.idOpe == "AZAPTY"
        ){
            operador = this.idOpe;
            this.link1 = ConfigService.configFile.anuncios[operador].principal;
            this.anuncio1 = './assets/img/anuncio1_'+operador+'.jpg';
        }else{
            this.link1 = ConfigService.configFile.anuncios.principal;
            this.anuncio1 = './assets/img/anuncio1.jpg';
        }
    }
    loadMore($event) {
        let scrollHeight = $event.srcElement.children[0].scrollHeight;
        let clientHeight = $event.srcElement.children[0].clientHeight;
        let scrollOffset = $event.srcElement.children[0].scrollTop;
        let screenHeight = scrollHeight - clientHeight;
        let limit = screenHeight - (screenHeight * 0.30);
        if (limit < scrollOffset) {
            this.limitResult += 5;
        }
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

    calculoTDC(tarifa, tdc) {
        let currency_user = this.user;

        if (tdc === null || tdc == 0) {
            var tasaCambioFB = this.currencies.find(function (tc) { return tc.currency_name == currency_user.currency });
            tdc = tasaCambioFB.tasa_cambio;
        }
        var total = tarifa * tdc;
        return total;
    }

    getCotizaciones(page = 1, sizePage = 25) {
        this.cotizacionesService.getCotizacionesPaginadas(page, sizePage).subscribe(response => {
            this.getPager(response);
            this.page = response.total;
            this.cotizaciones = response.cotizaciones;
            this.hideLoader();
        });
    }

    getHistorial(page = 1, sizePageC = 25) {
        this.cotizacionesService.getHistorialPaginado(page, sizePageC).subscribe(response => {
            this.getPagerC(response);
            this.page = response.total;
            this.historial = response.data;
            this.hideLoader();
        });
    }

    getPDF(folio: string) {
        this.cotizacionesService.getPDF(folio).subscribe(response => {
            if (response.status == 'success') {
                window.open(response.data);
            } else {
                this.swal.error(response.title, response.msg)
            }
        });
    }

    crearPDF() { }

    showPreview() {
        var title;
        this.translate.get('cotizaciones.atencion').subscribe((data:any)=> { title = data;});
        var msg;
        this.translate.get('cotizaciones.seleccion-items').subscribe((data:any)=> { msg = data;});
        let selected = [];
        this.cotizaciones.forEach(cotizacion => {
            if (typeof cotizacion.selected != 'undefined' && cotizacion.selected == true) {
                selected.push(cotizacion);
            }
        });
        if (selected.length <= 7) {
            // localStorage.setItem('cotizaciones', JSON.stringify(selected));
            // this.router.navigate(['cotizaciones/preview']);
            let navigationExtras: NavigationExtras = {
                state: {
                    cotizaciones: selected
                }
            };
            this.router.navigate(['cotizaciones/preview'], navigationExtras);
        } else {
            this.swal.alert(title, msg);
        }
    }

    selectAll(all, cotizaciones) {
        this.isDisabled = !all;
        cotizaciones.forEach(cotizacion => {
            cotizacion.selected = all;
        });
    }

    selectAllHistorial(all, cotizaciones) {
        this.isDisabledH = !all;
        cotizaciones.forEach(cotizacion => {
            cotizacion.selected = all;
        });
    }

    getSelected(cotizacion) {
        cotizacion.selected = !cotizacion.selected;
        this.isDisabled = true;
        this.cotizaciones.forEach(cotizacion => {
            if (typeof cotizacion.selected != 'undefined' && cotizacion.selected == true) {
                this.all = false;
                this.isDisabled = false;
            }
        })
    }

    getSelectedHistorial(cotizacion) {
        cotizacion.selected = !cotizacion.selected;
        this.isDisabledH = true;
        this.historial.forEach(h => {
            if (typeof h.selected != 'undefined' && h.selected == true) {
                this.allHistorial = false;
                this.isDisabledH = false;
            }
        });
    }

    delCotizacion() {
        let cotizacion = '';
        let selected = [];
        this.cotizaciones.forEach(c => {
            if (typeof c.selected != 'undefined' && c.selected == true) {
                selected.push(c);
            }
        });
       
        selected.forEach(c => {
            cotizacion += c.cotizacion_id + ',';
        });
      /*   return false; */
        cotizacion = cotizacion.replace(/,\s*$/, "");
        this.cotizacionesService.delCotizacion(cotizacion).subscribe(response => {
            this.swal.alert(response.title, response.msg);
            this.getCotizaciones();
        });
    }

    delHistorial() {
        let cotizacion = '';
        let selected = [];
        this.historial.forEach(h => {
            if (typeof h.selected != 'undefined' && h.selected == true) {
                selected.push(h);
            }
        });
        selected.forEach(h => {
            cotizacion += h.folio + ',';
        });
        cotizacion = cotizacion.replace(/,\s*$/, "");
        this.cotizacionesService.delHistorial(cotizacion).subscribe(response => {
            this.swal.alert(response.title, response.msg);
            this.getHistorial();
        });
    }

    visto() {
        this.cotizacionesService.visto().subscribe(response => {
            this.cotizaciones_novistas = 0;
            this.cotizacionesService.setCotizacionesNoVistas(this.cotizaciones_novistas);
        });
    } // Notificacion?

    trustContent() { }

    mostrarNumItems(ev) {
        this.getCotizaciones(1, ev);
    }
    mostrarNumItemsC(ev) {
        this.getHistorial(1, ev);
    }

    goToPage(page, numItems) {
        this.getCotizaciones(page, numItems);
    }
    goToPageC(page, numItems) {
        this.getHistorial(page, numItems);
    }
    getPager(pagination) {
        let pageSize = 7;
        let totalPages = pagination.total;
        let currentPage = pagination.page
        let startPage: number, endPage: number;

        if (currentPage < 1) {
            currentPage = 1;
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        if (totalPages <= pageSize) {
            startPage = 1;
            endPage = totalPages;
        } else {
            if (currentPage <= 3) {
                startPage = 1;
                endPage = pageSize;
            } else if (currentPage + 2 >= totalPages) {
                startPage = totalPages - pageSize;
                endPage = totalPages;
            } else {
                startPage = currentPage - 2;
                endPage = currentPage + 2;
            }
        }

        let pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);
        this.paginacion = {
            currentPage: currentPage,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            pages: pages
        }
    }

    getPagerC(paginationC) {
        let pageSize = 7;
        let totalPages = paginationC.total;
        let currentPage = paginationC.page
        let startPage: number, endPage: number;

        if (currentPage < 1) {
            currentPage = 1;
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        if (totalPages <= pageSize) {
            startPage = 1;
            endPage = totalPages;
        } else {
            if (currentPage <= 3) {
                startPage = 1;
                endPage = pageSize;
            } else if (currentPage + 2 >= totalPages) {
                startPage = totalPages - pageSize;
                endPage = totalPages;
            } else {
                startPage = currentPage - 2;
                endPage = currentPage + 2;
            }
        }

        let pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);
        this.paginacionC = {
            currentPage: currentPage,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            pages: pages
        }
    }
}
