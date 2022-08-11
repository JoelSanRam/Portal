import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SweetalertService } from '../../../services/sweetalert.service';
import { ReservacionesService } from '../../../services';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-cancelacion',
  templateUrl: './cancelacion.component.html',
  styleUrls: ['./cancelacion.component.sass']
})
export class CancelacionComponent implements OnInit {

  @Input() data;
  textAreaMostrar: boolean = false
  cancelacionesList: any = {};
  motivosList: any = [];
  valueSelect;
  textSelect;
  textAreaMotivo;

  constructor(
    private swal: SweetalertService,
    private reservacionesService: ReservacionesService,
    private spinnerService: NgxSpinnerService,
    public activeModal: NgbActiveModal,) { }

  ngOnInit(): void {
    this.cancelacionesList = this.data;
    // console.log(this.cancelacionesList)
    this.getListMotivos();
  }

  getListMotivos() {
    this.reservacionesService.getListMotivos().subscribe((res) => {
      this.motivosList = res;
      // console.log(this.motivosList);
    });
  }

  onChangeOption(value) {
    this.valueSelect = value.target.value;
    this.textSelect = value.target.options[value.target.selectedIndex].text;
    console.log(this.valueSelect);
    if (this.valueSelect == 5) {
      this.textAreaMostrar = true
    } else {
      this.textAreaMostrar = false;
    }
  }

  accionCancelar() {
    if (this.valueSelect == 5) {
      this.textSelect = this.textAreaMotivo;
    }
    if (this.valueSelect == '' || this.valueSelect == NaN || this.valueSelect == undefined) {
      this.swal.error('Error', 'Seleccione un motivo de cancelación');
    } else {
      if (this.textSelect == undefined || this.textSelect == '') {
        this.swal.error('Error', 'Escriba el motivo de cancelación');
      } else {
        this.spinnerService.show();
        var datosReserva = {
          IdReserva: this.cancelacionesList.IdReserva,
          motivo_cancelacion: this.textSelect,
          motivo_id: parseInt(this.valueSelect),
          cancelacion_automatica: this.cancelacionesList.cancelacion_automatica,
          aplica_penalidad: this.cancelacionesList.aplica_penalidad,
          costo_penalidad_proveedor: this.cancelacionesList.costo_penalidad_proveedor,
          costo_penalidad_agencia: this.cancelacionesList.costo_penalidad_agencia,
          costo_penalidad_publica: this.cancelacionesList.costo_penalidad_publica,
          tarifa_proveedor: this.cancelacionesList.tarifa_proveedor,
          tarifa_agencia: this.cancelacionesList.tarifa_agencia,
          tarifa_publica: this.cancelacionesList.tarifa_publica,
          autoriza_hotel_soporte: false,
          reserva_currency: this.cancelacionesList.reserva_currency,
          reserva_currency_tc: this.cancelacionesList.reserva_currency_tc,
        }
        console.log("si se pudo", datosReserva);
        // setTimeout(() => {
        //   this.spinnerService.hide();
        //   this.swal.success("res.title", "res.msg");
        //   this.activeModal.close();
        // }, 3000);
        // return false;

        this.reservacionesService.patchCancelacion(this.cancelacionesList.IdReserva, datosReserva).subscribe(res => {

          this.spinnerService.hide();
          if (res.status == 'success') {
            this.swal.success(res.title, res.msg);
            this.activeModal.close();
            console.log(datosReserva);
          } else {
            this.swal.error(res.title, res.msg);
          }
        },
        error => {
            this.spinnerService.hide();
            this.swal.error('Error intentelo de nuevo más tarde', 'error');
        });
      }
    }
  }

}
