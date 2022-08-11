import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SweetalertService } from '../../../../services/sweetalert.service';
import { NgxSpinnerService } from "ngx-spinner";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgenciaService, AuthenticationService, SharedService, PagosService } from '@app/services';
import { ModalpagoComponent } from './modalpago/modalpago.component';
import { User } from '@app/models';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-pago',
  templateUrl: './pago.component.html',
  styles: []
})
export class PagoComponent implements OnInit {
  @Input() datos;
  maximo;
  datosr;
  monto;
  tipopago;
  tarjetatipo = 1;
  tpago = 0;
  pagofinal: FormGroup;
  arreglomeses = [];
  arreglomesesamex = [];
  forzarpublica;
  forzarneta;
  comision;
  sumarcomision = 0;
  comivisamaster;
  comiamex;
  cambionetaame;
  cambionetavima;
  cantidadpago = 1;
  textopago;
  textocomision;
  comisionpercent;
  comisioncambio;
  utilidadpercent;
  cantidad;
  monmax;
  totalpago;
  totalComisionPerc;
  totalComisionDec;
  iva = 1.16;
  impComisionIva;
  pagosumaperce;
  pagosuma;
  comisionneutro;
  pagoneutro;
  tarjetatexto = 'vima';
  tipoptexto = 'cre';
  tarinan = false;
  user;
  idOpe;
  currentUser: User;
  constructor(
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private agenciaService: AgenciaService,
    private pagosService: PagosService,
    private authenticationService: AuthenticationService,
    private swal: SweetalertService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private spinnerService: NgxSpinnerService,
    private translate: TranslateService,
  ) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.idOpe = this.currentUser.userData.idOperador;
    this.pagofinal = this.formBuilder.group({
      tarjetatipo: ['', Validators.required],
      tpago: ['', Validators.required],
      mesesp: [''],
      comision: [''],
      mesespamex: [''],
      brokers: [''],
      totalpago: [''],
      pagoneutro: [''],
      comisionneutro: ['']
    });
  }

  ngOnInit() {
    this.spinnerService.show();
    this.getMeses();
    this.maximo = this.datos.maximo;
    this.datosr = this.datos.datosr;
    this.monto = this.datos.montoPag;
    this.tipopago = this.datos.tipop;
    this.monmax = this.datos.maximo;
  }

  getMeses() {
    this.pagosService.getDatosH(this.idOpe).subscribe(result => {
      this.arreglomeses = result.meses.mesesdispo;
      this.arreglomesesamex = result.meses.mesesdispoamex;
      this.forzarpublica = result.forzar.publica;
      this.forzarneta = result.forzar.neta;
      this.comivisamaster = result.comisiones[0];
      this.comiamex = result.comisiones[2];
      this.cambionetaame = result.cambioneta.AME;
      this.cambionetavima = result.cambioneta.VIMA;
      this.formula();
      this.spinnerService.hide();
    });
  }

  tarjeta(value) {
    if (value == 1) {
      this.tarjetatipo = 1;
      this.tarjetatexto = 'vima';
    } else {
      this.tarjetatipo = 2;
      this.tarjetatexto = 'amex';
    }
    this.formula();
  }

  tipopagot(value) {
    if (value == 1) {
      this.tpago = 1;
      this.tipoptexto = 'cre';
    }
    if (value == 2) {
      this.tpago = 2;
      this.tipoptexto = 'deb';
    }
    if (value == 3) {
      this.tpago = 3;
      this.tipoptexto = 'ext';
    }
    this.formula();
  }

  numonto(total) {
    this.totalpago = total;
    if (this.totalpago > this.monmax) {
      this.tarinan = true;
    } else {
      this.tarinan = false;
    }
    this.formula();
  }

  checksum(value) {
    if (value == true) {
      this.sumarcomision = 1;
    } else {
      this.sumarcomision = 0;
    }
    this.formula();
  }

  mesespago(value) {
    this.cantidadpago = value;
    this.formula();
  }

  formula() {
    var comisionBancaria;
    this.translate.get('reservaciones.comision-bancaria').subscribe((data: any) => { comisionBancaria = data; });
    switch (this.cantidadpago) {
      case 1:
        if (this.tarjetatipo == 1) {
          if (this.comivisamaster.credito >= 0) {
            this.comisionpercent = this.comivisamaster.credito;
          } else {
            this.comisionpercent = this.comivisamaster.contado;
          }
          this.comisioncambio = this.cambionetavima.vmuno;
        } else {
          if (this.comiamex.credito >= 0) {
            this.comisionpercent = this.comiamex.credito;
          } else {
            this.comisionpercent = this.comiamex.contado;
          }
          this.comisioncambio = this.cambionetaame.amecre;
        }
        this.textopago = 'un solo pago';
        break;
      case 3:
        if (this.tarjetatipo == 1) {
          this.comisionpercent = this.comivisamaster.msi_3;
          this.comisioncambio = this.cambionetavima.vmtres;
        } else {
          this.comisionpercent = this.comiamex.msi_3;
          this.comisioncambio = this.cambionetaame.ametres;
        }
        this.textopago = '3 meses';
        break;
      case 6:
        if (this.tarjetatipo == 1) {
          this.comisionpercent = this.comivisamaster.msi_6;
          this.comisioncambio = this.cambionetavima.vmseis;
        } else {
          this.comisionpercent = this.comiamex.msi_6;
          this.comisioncambio = this.cambionetaame.ameseis;
        }
        this.textopago = '6 meses';
        break;
      case 9:
        if (this.tarjetatipo == 1) {
          this.comisionpercent = this.comivisamaster.msi_9;
          this.comisioncambio = this.cambionetavima.vmnueve;
        } else {
          this.comisionpercent = this.comiamex.msi_9;
          this.comisioncambio = this.cambionetaame.amenueve;
        }
        this.textopago = '9 meses';
        break;
      case 12:
        if (this.tarjetatipo == 1) {
          this.comisionpercent = this.comivisamaster.msi_12;
          this.comisioncambio = this.cambionetavima.vmdoce;
        } else {
          this.comisionpercent = this.comiamex.msi_12;
          this.comisioncambio = this.cambionetaame.amedoce;
        }
        this.textopago = '12 meses';
        break;
      case 15:
        if (this.tarjetatipo == 1) {
          this.comisionpercent = this.comivisamaster.msi_15;
          this.comisioncambio = 0;
        } else {
          this.comisionpercent = this.comiamex.msi_15;
          this.comisioncambio = this.cambionetaame.amequince;
        }
        this.textopago = '15 meses';
        break;
      case 18:
        if (this.tarjetatipo == 1) {
          this.comisionpercent = this.comivisamaster.msi_18;
          this.comisioncambio = this.cambionetavima.vmdieciocho;
        } else {
          this.comisionpercent = this.comiamex.msi_18;
          this.comisioncambio = this.cambionetaame.amedieciocho;
        }
        this.textopago = '18 meses';
        break;
    }
    if (this.comisioncambio > 0) {
      switch (this.tipopago) {
        case 1:
          if (this.comisioncambio < this.datosr.utilidad) {
            this.utilidadpercent = this.comisioncambio / 100;
            this.cantidad = this.datosr.importe_publico - (this.datosr.importe_publico * this.utilidadpercent);
            this.textocomision = 'Advertencia: al seleccionar este método de pago, su comisión cambiara a ser del: ' + this.comisioncambio + '%, y por lo tanto cambia su tarifa Neta, si no desea este cambio, favor de seleccionar otro método de pago.';
          } else {
            this.cantidad = this.monto;
            this.textocomision = '';
          }
          break;
        case 2:
          this.cantidad = this.datosr.importe_publico;
          if (this.comisioncambio < this.datosr.utilidad) {
            this.textocomision = 'Si seleciona este metodo de pago, la reserva tendra una comision del ' + this.comisioncambio;
          } else {
            this.textocomision = '';
          }
          break;
        case 3:
          this.cantidad = this.totalpago;
          if (this.comisioncambio < this.datosr.utilidad) {
            this.textocomision = 'Si seleciona este metodo de pago, la reserva tendra una comision del ' + this.comisioncambio;
          } else {
            this.textocomision = '';
          }
          break;
      }
    } else {
      switch (this.tipopago) {
        case 1:
          this.cantidad = this.monto;
          break;
        case 2:
          this.cantidad = this.datosr.importe_publico;
          break;
        case 3:
          this.cantidad = this.totalpago;
          break;
      }
      this.textocomision = comisionBancaria + this.textopago;
    }
    this.totalComisionPerc = parseFloat(this.comisionpercent.toFixed(4));
    this.totalComisionDec = this.totalComisionPerc / 100;
    this.totalComisionDec = parseFloat(this.totalComisionDec.toFixed(4));

    this.impComisionIva = this.iva * (this.cantidad * this.totalComisionDec) / (1 - (this.totalComisionDec * this.iva));
    this.impComisionIva = parseFloat(this.impComisionIva.toFixed(2));
    let comisionn = this.impComisionIva;
    let monton = this.cantidad;
    this.comisionneutro = comisionn;
    this.pagoneutro = monton;
    if (this.sumarcomision = 1) {
      this.pagosumaperce = comisionn + monton;
    } else {
      this.pagosumaperce = monton;
    }

    this.pagosuma = parseFloat(this.pagosumaperce.toFixed(2));

  }

  pagarReserva(tipo) {
    let paramsn = {
      idOperador: this.idOpe,
      montototal: this.pagosuma,
      pagosuma: this.pagosuma,
      reserva: {
        detalles: {
          0: {
            detalles: 'uno'
          }
        },
        datosres: this.datosr
      },
      tarjeta: this.tarjetatexto,
      tipop: this.tipoptexto,
      cantp: this.cantidadpago,
      cantpamex: this.cantidadpago
    };
    this.pagosService.generateLink(paramsn).subscribe(result => {
      if (result.status = 'success') {
        const modalRef = this.modalService.open(ModalpagoComponent, { backdrop: 'static' });
        modalRef.componentInstance.link = result.link;
        modalRef.componentInstance.tipo = tipo;
        modalRef.componentInstance.datosr = paramsn;
      }
    });
  }

}
