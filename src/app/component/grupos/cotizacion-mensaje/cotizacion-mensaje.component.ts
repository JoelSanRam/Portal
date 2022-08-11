import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SweetalertService } from '../../../services/sweetalert.service';
import { AuthenticationService, GruposService, SharedService } from "../../../services";
import { NgxSpinnerService } from "ngx-spinner";
import { LottieService } from '@app/services/lottie.service';


@Component({
  selector: 'app-cotizacion-mensaje',
  templateUrl: './cotizacion-mensaje.component.html',
  styleUrls: []
})
export class CotizacionMensajeComponent implements OnInit {
  @Input() cotizacion;
  mensajesList: any = [];
  mensajeNuevo = '';
  idAgencia;
  idAuth;
  url_loader;

  constructor(
    private swal: SweetalertService,
    private gruposService: GruposService,
    private sharedService: SharedService,
    private spinnerService: NgxSpinnerService,
    public activeModal: NgbActiveModal,
    private lottieService: LottieService,
    private authenticationService: AuthenticationService,
  ) { 
    this.sharedService.usuarioObserver.subscribe(user => {
      this.idAuth = user.uid;
    });
    this.sharedService.agenciaObserver.subscribe(agencia => {
      this.idAgencia = agencia.idAgencia;
    });
    this.authenticationService.setTypeLoader('defaul');
  }

  ngOnInit() {
    this.authenticationService.getTypeLoader().subscribe((res)=>{
      if(res != undefined){
        this.url_loader = res
      }
    })
    // this.spinnerService.show();
    this.showloader();
    this.getMensajes();
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

  getMensajes () {
    this.gruposService.getMensajes(this.cotizacion.folio).subscribe(response => {
      this.mensajesList = response;
      // this.spinnerService.hide();
      this.hideLoader();
    });
  }

  sendMensaje (mensaje) {
    // this.spinnerService.show();
    this.showloader();
    const params = {
      folio: this.cotizacion.folio,
      idAgencia: this.idAgencia,
      idAuth: this.idAuth,
      mensaje: mensaje
    }
    this.gruposService.sendMensaje(params).subscribe(response => {
      this.mensajeNuevo = '';
      this.getMensajes();
      // this.spinnerService.hide();
      this.hideLoader();
    })
  }

}
