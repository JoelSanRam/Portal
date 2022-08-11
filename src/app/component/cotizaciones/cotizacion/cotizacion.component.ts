import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from "@angular/common";
import { NgxSpinnerService } from "ngx-spinner";
import { FichaTecnicaComponent } from './ficha-tecnica/ficha-tecnica.component';
import { AuthenticationService, CotizacionesService, SharedService, SweetalertService } from "@app/services";
import { GaleriaFotosComponent } from './galeria-fotos/galeria-fotos.component';
import { EnviarCotizacionComponent } from './enviar-cotizacion/enviar-cotizacion.component';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@app/models';
import { TranslateService } from '@ngx-translate/core';
import { LottieService } from '@app/services/lottie.service';
@Component({
  selector: 'app-cotizacion',
  templateUrl: './cotizacion.component.html',
  styleUrls: []
})
export class CotizacionComponent implements OnInit {
    cotizaciones;
    hoteles = [];
    descuento = 0;
    sumaExtra;
    txtextra;
    generando = false;
    fecha = new Date(Date.now());
    lasHotel=-1;
    tokenHotel=-1;
    user;   
    idOpe;
    currentUser: User;
    btnDisabled = true;
    btnDisabledGenerar = false;
    imgruta;
    url_loader;
    today = new Date(Date.now());
    constructor(
        private modalService: NgbModal,
        private datePipe: DatePipe,
        private cotizacionesService: CotizacionesService,
        private router: Router,
        public sharedService: SharedService,
        private swal: SweetalertService,
        private authenticationService: AuthenticationService,
        private route: ActivatedRoute,
        private spinnerService: NgxSpinnerService,
        private translate: TranslateService,
        private lottieService: LottieService,
    ) {
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
        this.idOpe = this.currentUser.userData.idOperador;
        
        this.sharedService.usuarioObserver.subscribe(user => {
            this.user = user;
        });
        this.route.queryParams.subscribe(params => {
            if(this.router.getCurrentNavigation().extras.state){
                this.cotizaciones = this.router.getCurrentNavigation().extras.state.cotizaciones;
            }
        });
        if(!this.cotizaciones){
            this.router.navigate(['cotizaciones']);
        }
        this.imgruta='../../../assets/img/spinners/tarifas.gif?'+this.today;
        this.authenticationService.setTypeLoader('defaul');
        this.authenticationService.getLang().subscribe(res=>{
            translate.setDefaultLang(res);
        });
     }

    ngOnInit() { 
        this.authenticationService.getTypeLoader().subscribe((res)=>{
            if(res != undefined){
              this.url_loader = res
            }
          })
        // this.spinnerService.show();
        this.showloader();
        // this.cotizaciones = JSON.parse(localStorage.getItem("cotizaciones"));
            // console.log('raw',this.cotizaciones)
            for (const c of this.cotizaciones) {
                this.tokenHotel = c.hotel_id;
                if (this.lasHotel!= this.tokenHotel) {
                    this.hoteles.push({
                        'hotel_id': c.hotel_id,
                        'idBroker': c.idBroker,
                        'hotel_nombre': c.hotel_nombre,
                        'room_id': c.room_id,
                        'room_nombre': c.room_nombre,
                        'plan_id': c.plan_id,
                        'plan_nombre': c.plan_nombre,
                        'fecha': this.datePipe.transform(this.fecha),
                        'ficha': [],
                        'fotos': [],
                        'galeria': []
                    });
                }
                this.lasHotel = this.tokenHotel;
            }
            this.getDatosHotel();

            setTimeout(() => {
                // this.spinnerService.hide();
                this.hideLoader();
            }, 8000);

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

    getDatosHotel () {
        let json;
        let idOperador = this.idOpe;
        let ServiceCotizacion = this.cotizacionesService;
        let pipeDate = this.datePipe;
        let fecha = this.fecha;
        let btnDis;
        this.hoteles.forEach(function(h,i,arr){
            json = {
                broker: h.idBroker,
                idHotel: h.hotel_id,
                operador: idOperador
            };
            ServiceCotizacion.getHotelInfo(json).subscribe(response => {
                if(typeof (response.data) != 'undefined'){
                    //adaptacion de nodos V2 a los base de ficha tecnica
                    let hotel = response.data.hotel;
                    let galeria = response.data.gallery;
                    let fichaTecnicaU2 = {
                        datoshotel: {
                            categoria:'',
                            checkin:'',
                            checkout:'',
                            direccion:'',
                            id:'',
                            location:{
                                pais:'',
                                estado:'',
                                ciudad:''
                            },
                            mapa:{
                                longitud:'',
                                latitud:''
                            },
                            info:'',
                            nombre:'',
                            telefonos:[],
                        },
                        // fachada: '',
                        idBroker: '',
                        imagenes: [],
                        instalaciones: {
                            bares:[],
                            discos:[],
                            restaurantes:[]
                        },
                        mapa:{
                            latitud:'',
                            longitud:''
                        },
                        servicios:[]
                    };

                    let imagenes = [];
                    for(let img of galeria){
                        imagenes.push({titulo:img.title,path:img.url});
                    }

                    fichaTecnicaU2.datoshotel.categoria = hotel.category.id;
                    fichaTecnicaU2.datoshotel.direccion = hotel.address;
                    fichaTecnicaU2.datoshotel.id = hotel.code;
                    fichaTecnicaU2.datoshotel.info = hotel.description;
                    fichaTecnicaU2.datoshotel.mapa.latitud = hotel.location.latitude;
                    fichaTecnicaU2.datoshotel.mapa.longitud = hotel.location.longitude;
                    fichaTecnicaU2.datoshotel.nombre = hotel.name;
                    fichaTecnicaU2.idBroker= hotel.broker;
                    fichaTecnicaU2.mapa.latitud= hotel.location.latitude;
                    fichaTecnicaU2.mapa.longitud= hotel.location.longitude;
                    fichaTecnicaU2.imagenes = imagenes;
                    
                    arr[i].ficha_tecnica = fichaTecnicaU2;
                    arr[i].ficha_tecnica.unificacion = 1;
                    arr[i].fecha = pipeDate.transform(fecha);
                }else{
                    arr[i].ficha_tecnica = response;
                    arr[i].ficha_tecnica.unificacion = 0;
                    arr[i].fecha = pipeDate.transform(fecha);
                }
            },err =>{
                arr[i].ficha_tecnica = [];
                arr[i].ficha_tecnica.imagenes = [];
                arr[i].fecha = pipeDate.transform(fecha);
            });
            btnDis = true
            if(i === arr.length-1){
                btnDis = false;
            }
        });
        this.btnDisabled = btnDis;
    }


    cotizacionForm () {
        this.btnDisabledGenerar = true;
        let modalS;
        let ids = '';
        let hoteles = [];
        let data = {
            uid: '',
            hoteles: this.hoteles,
            cotizaciones: this.cotizaciones,
            descuento: this.descuento,
            montoextra: this.txtextra // Monto añadido sobre el total
        }
        for(let c of data.cotizaciones) {
            ids += c.cotizacion_id + ','; 
        }
        ids = ids.replace(/,\s*$/, "");
        data.hoteles.forEach(function(h,i,arr){
            let hotel ={
                'hotel_id':h.hotel_id,
                'idBroker':h.idBroker,
                'ficha':h.ficha,
                'fotos':h.fotos,
                'galeria':h.img_selected,
                'data':h,
            };
            hoteles.push(hotel);
            modalS = false;
            if(i === arr.length-1){
                modalS = true;
            }
        });
        if(modalS){
            const modalRef = this.modalService.open(EnviarCotizacionComponent, { size: 'sm' });
            modalRef.componentInstance.data = data;
            modalRef.componentInstance.ids = ids;
            modalRef.componentInstance.hoteles = hoteles;
        }
        
    }

    openFotos (hotel) {
        const modalRef = this.modalService.open(GaleriaFotosComponent, { size: 'lg' });
        modalRef.componentInstance.hotel = hotel;
        modalRef.result.then((result) => {
            hotel.img_selected = result;
        }).catch((error) => {
        });
    }

    openDetalles(fichaTecnica) {
        var title;
        this.translate.get('cotizaciones.atencion').subscribe((data:any)=> { title = data;});
        if(fichaTecnica == null){
            this.swal.alert(title, "Este hotel no cuenta con Ficha técnica");
        }else{
            const modalRef = this.modalService.open(FichaTecnicaComponent, { size: 'lg' });
            modalRef.componentInstance.fichaTecnica = fichaTecnica;
            modalRef.result.then((result) => {
            }).catch((error) => {
            });
        }
       
    }


    calculoTDC(tarifa, tdc) { 
        var total = tarifa * tdc;
        return this.calcularImporte(total);
    }
    calcularImporte (importe) {
        let descuento = 0;
        let sumaExtra = 0;
        if (this.descuento != 0) {
            var descuento_ = this.descuento * -1;
            descuento = importe * (descuento_ / 100);
        }
        
        if (typeof this.txtextra != 'undefined') {
            sumaExtra = this.txtextra;
        }
        let total = importe - descuento;
        total = Math.ceil(total);
        return total + sumaExtra;
    }

    sumarExtra () {
        if (typeof this.sumaExtra != 'undefined' && this.sumaExtra != '') {
            this.txtextra = this.sumaExtra;
        }
    }

    borrarExtra () {
        this.txtextra = 0;
        this.sumaExtra = 0;
    }
}
