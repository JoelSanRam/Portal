import { Component, OnInit, Input, Pipe, PipeTransform } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService, SharedService, PagosService } from '@app/services';
import { SweetalertService } from '../../../../../services/sweetalert.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-modalpago',
  templateUrl: './modalpago.component.html',
  styles: []
})
export class ModalpagoComponent implements OnInit {
  @Input() link;
  @Input() tipo;
  @Input() datosr;
  arreglo;
  correo: FormGroup;
  urlSafe;
  submitted = false;
  tpt;
  constructor(
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private authenticationService: AuthenticationService,
    private swal: SweetalertService,
    private pagosService: PagosService,
    private modalService: NgbModal,
    private spinnerService: NgxSpinnerService,
    public activeModal: NgbActiveModal,
    public sanitizer: DomSanitizer,
    private translate: TranslateService,
  ) {
    this.correo = this.formBuilder.group({
      correo: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.spinnerService.show();
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.link);
    this.spinnerService.hide();
  }

  enviocorreo() {
    var intentoError;
    this.translate.get('reservaciones.intento-error').subscribe((data: any) => { intentoError = data; });
    var error;
    this.translate.get('reservaciones.error').subscribe((data: any) => { error = data; });
    let correox = this.correo.value
    console.info('el correo', correox);
    let tarjeta = this.datosr.tipop;
    if (tarjeta == 'cre') {
      this.tpt = this.datosr.cantp;
    } else {
      this.tpt = this.datosr.cantpamex;
    }
    this.submitted = true;
    this.arreglo = {
      arreglo: {
        idLink: this.link,
        detalles: {
          ref: this.datosr.reserva.datosres.idReserva,
          tp: this.tpt,
          amount: this.datosr.pagosuma,
        },
      },
      correo: correox.correo
    };
    if (this.correo.invalid) {
      return;
    }
    console.info('el arreglo', this.arreglo);
    this.spinnerService.show();
    this.pagosService.envioCorreo(this.arreglo).subscribe(res => {
      this.spinnerService.hide();
      this.swal.success(res.title, res.msg);
    },
      error => {
        this.spinnerService.hide();
        this.swal.error(intentoError, error);
      });

  }

}
