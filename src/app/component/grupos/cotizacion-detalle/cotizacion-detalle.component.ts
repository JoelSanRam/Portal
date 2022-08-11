import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SweetalertService } from '../../../services/sweetalert.service';
@Component({
  selector: 'app-cotizacion-detalle',
  templateUrl: './cotizacion-detalle.component.html',
  styleUrls: []
})
export class CotizacionDetalleComponent implements OnInit {
  @Input() cotizacion;


  constructor(
    public activeModal: NgbActiveModal,
    private swal: SweetalertService,
  ) { }

  ngOnInit() {
  }

}
