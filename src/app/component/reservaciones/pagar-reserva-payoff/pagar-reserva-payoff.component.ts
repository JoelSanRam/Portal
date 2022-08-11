import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SweetalertService } from '../../../services/sweetalert.service';
import { ReservacionesService, PagoPayoffService } from '../../../services';
import { NgxSpinnerService } from "ngx-spinner";
import { PagoComponent } from '../pagar-reserva/pago/pago.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pagar-reserva-payoff',
  templateUrl: './pagar-reserva-payoff.component.html',
  styleUrls: ['./pagar-reserva-payoff.component.sass']
})
export class PagarReservaPayoffComponent implements OnInit {
  @Input() reserva;
  id;
  precioNe;
  precioPu;
  datosRes;
  detReserva;
  saldo;
  maxpag;
  depositos = [];
  monto: boolean;
  montoTotal: number = 0;
  radioSelect: any;
  idAgencia: any;
  key: string;
  ligaPago: string;

  constructor( private swal: SweetalertService,
    private reservacionesService: ReservacionesService,
    private spinnerService: NgxSpinnerService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    public sweetAlertService: SweetalertService,
    public pagoPayoffService: PagoPayoffService) {
    this.monto = false;
    
   }

   ngOnInit() {
    this.idAgencia = JSON.parse(localStorage.getItem('access_agen'));

    var json = {
      "idOperador": this.reserva.datosreserva.idOperador
    };
    this.pagoPayoffService.getKey(json).subscribe(r => {
      this.key = r;
    });
    
    this.spinnerService.show();
    this.id = this.reserva.datosreserva.idReserva;
    this.datosRes = this.reserva.datosreserva;
    this.detReserva = this.reserva.detalles;
    const currency = this.datosRes.reserva_currency;
    if (currency == 'USD') {
        const tazaCambio = this.datosRes.reserva_currency_tc;
        const dolaresN = this.datosRes.importe_agen;
        const dolaresP = this.datosRes.importe_publico;
        this.precioNe = dolaresN * tazaCambio;
        this.precioPu = dolaresP * tazaCambio;
        this.precioNe = Math.ceil(this.precioNe);
        this.precioPu = Math.ceil(this.precioPu);
    } else {
        this.precioNe = this.datosRes.importe_agen;
        this.precioPu = this.datosRes.importe_publico;
    }
    this.consultarSaldo(this.id);
    this.consultarDepositos(this.id);
}

consultarSaldo(id) {
  
    this.reservacionesService.consultarSaldo(id).subscribe((r) => {
        if (r == false) {
          
            this.saldo = this.precioNe;
            this.maxpag = this.precioPu;
        } else {
    
            this.saldo = Number(r.saldo);
            this.maxpag = Number(r.saldo);
        }
    });
}

consultarDepositos(id) {
    this.reservacionesService.consultarDepositos(id).subscribe((r) => {
        this.depositos = r;
    });
    this.spinnerService.hide();
}

showDetalle(detalles) {
}

modalPagar(tipo, r, max, datosres) {
    let data = {
        montoPag: r,
        tipop: tipo,
        maximo: max,
        datosr: datosres
      }
    const modalRef = this.modalService.open(PagoComponent, {backdrop:'static', size:'lg'});
    modalRef.componentInstance.datos = data;
}

  changeShowMonto(status: boolean, seleccion: number){
    this.monto = status;
    switch (seleccion) {
      case 1:
        this.montoTotal = this.precioNe;
        break;
      case 2:
        this.montoTotal = this.precioPu;
        break;
      case 3:
        this.montoTotal = 0;
        break;
      default:
        break;
    }
  }

  pagarReserva() {

    if( this.montoTotal <= 0){
      this.sweetAlertService.error(
        'Datos no validos',
        'Por favor ingrese un monto mayor a cero.'
      );
      return;
    }
    
    if(this.montoTotal > this.reserva.datosreserva.importe_publico){
      this.sweetAlertService.error(
        'Monto inválido',
        'El monto no puede ser mayor a la tarifa publica.'
      );
      return;
    }

    
    var idproducto;
    switch (this.reserva.datosreserva.tipo_producto) {
        // circuito
        case 3:
            idproducto =  'CICC';
            break;
        //  hotel
        case 7:
            idproducto =  'HOCC';
            break;
        // tour
        case 10:
            idproducto =  'TOCC';
            break;
        // traslado
        case 11:
            idproducto =  'TRCC';
            break;
    
        default:
            break;
    }
    
    var metadata = JSON.stringify({
      idagencia: this.idAgencia,
      idoperador:this.reserva.datosreserva.idOperador,
      monto: this.montoTotal,
      producto:this.reserva.datosreserva.tipo_producto,
      idreserva:this.reserva.datosreserva.idReserva,
      utilidad:this.reserva.datosreserva.utilidad,
      tipo: 1
    });


    var $json = {
      key: this.key,
      idproducto: idproducto,
      monto: Number(this.montoTotal),  
      referencia: this.reserva.datosreserva.idReserva,
      descripcion: this.reserva.datosreserva.nombre_hotel +' / '+  this.reserva.datosreserva.fecha_viaje +' / '+  this.reserva.datosreserva.pax,
      metadata:metadata,
      tipo:1
    };

    

    
    this.spinnerService.show();
    this.pagoPayoffService.crearLiga($json).subscribe( r => {
      if (r.status == 'SUCCESS') {
        this.spinnerService.hide();
        this.ligaPago = r.url;
        this.activeModal.close(r.url);

      }else{
        this.sweetAlertService.error(
          'Error',
          'Problemas al generar la liga de pago, intentelo de nuevo.'
        );
        this.spinnerService.hide();
      }
      
    });
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    
    if (charCode > 31  && (charCode < 46 || charCode > 57)) {
      return false;
    }
    return true;

  }
}
