import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SweetalertService } from '../../../services/sweetalert.service';
import { ReservacionesService } from '../../../services';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-reserva-detalle',
  templateUrl: './reserva-detalle.component.html',
  styleUrls: []
})

export class ReservaDetalleComponent implements OnInit {
  @Input() id;
  detReserva: any = {};
  servicios;

  constructor(
    private swal: SweetalertService,
    private reservacionesService: ReservacionesService,
    private spinnerService: NgxSpinnerService,
    public activeModal: NgbActiveModal,
  ) { }

  ngOnInit() {
    // this.spinnerService.show();
    this.getDetReserva(this.id);
  }

  getDetReserva(id: number) {
    this.reservacionesService.getDetReserva(id).subscribe(response => {
      this.detReserva = response;
      this.servicios = response.datosreserva.book_opciones;
      this.spinnerService.hide();
    });
  }

}
