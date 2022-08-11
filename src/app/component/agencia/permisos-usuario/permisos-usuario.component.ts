import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AgenciaService, SweetalertService, SessionService, SharedService } from '@app/services';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-permisos-usuario',
  templateUrl: './permisos-usuario.component.html',
  styleUrls: []
})
export class PermisosUsuarioComponent implements OnInit {
  @Input() usuario;
  permisos: any;
  sessionPermisos: any;
  PermisosAgencia: any;
  loading = false;
  constructor(
    private agenciaService: AgenciaService,
    private swal: SweetalertService,
    public activeModal: NgbActiveModal,
    private translate: TranslateService,
    private sessionservice: SessionService,
    private sharedService: SharedService,
  ) {
    this.sharedService.agenciaObserver.subscribe(agencia => {
      this.sessionPermisos = agencia.servicios;
    });
    this.sessionservice.getSession().subscribe(response => {
      if (response) {
        this.PermisosAgencia = JSON.parse(response);
      }
    });
  }

  ngOnInit() {
    this.permisos = this.usuario.permisos;
  }

  defaultPermisos() {

    switch (this.usuario.nivel) {
      case 50:
        this.permisos = {
          brokers: 1,
          reservar: 1,
          cotizar: 1,
          gastos_cancelacion: 1,
          reservaciones_agente: 0,
          reservaciones_todas: 1,
          cancelar_reservas: 1
        }
        break;
      default:
        this.permisos = {
          reservar: 1,
          cotizar: 1,
          gastos_cancelacion: 0,
          reservaciones_agente: 1,
          reservaciones_todas: 0,
          cancelar_reservas: 0
        };
        break;
    }
  }

  savePermisos() {
    this.agenciaService.savePermisos(this.usuario.uid, this.permisos).subscribe(response => {
      this.loading = false;
      this.swal.success(response.title, response.msg);
      this.activeModal.close('Modal Closed');
    },
      error => {
        this.loading = false;
        this.swal.error(error.title, error.msg);
      });
  }
  toggleTerms(event) {
    if (event.target.checked) {

    } else {

    }
  }
  viewReservasAgente(reservas_agente) {
    if (reservas_agente == 1) {
      this.permisos.reservaciones_todas = 0;
    }
  }
  reservarFuncion(reserva) {
    if (reserva == true) {
      this.permisos.reservar = 1;
    } else {
      this.permisos.reservar = 0;
    }
  }

  cotizarFuncion(cotizar) {
    if (cotizar == true) {
      this.permisos.cotizar = 1;
    } else {
      this.permisos.cotizar = 0;
    }
  }
  cancelarReservasFuncion(cancelar_reservas) {
    if (cancelar_reservas == true) {
      this.permisos.cancelar_reservas = 1;
    } else {
      this.permisos.cancelar_reservas = 0;
    }
  }
  gastosCancelacionReservasFuncion(gastos_cancelacion) {
    if (gastos_cancelacion == true) {
      this.permisos.gastos_cancelacion = 1;
    } else {
      this.permisos.gastos_cancelacion = 0;
    }
  }
  trasladosFuncion(traslados) {
    if (traslados == true) {
      this.permisos.traslados = 1;
    } else {
      this.permisos.traslados = 0;
    }
  }
  circuitosFuncion(circuitos) {
    if (circuitos == true) {
      this.permisos.circuitos = 1;
    } else {
      this.permisos.circuitos = 0;
    }
  }
  toursFuncion(tours) {
    if (tours == true) {
      this.permisos.tours = 1;
    } else {
      this.permisos.tours = 0;
    }
  }

  hotelesFuncion(hotel) {
    if (hotel == true) {
      this.permisos.hoteles = 1;
    } else {
      this.permisos.hoteles = 0;
    }
  }
  vuelosFuncion(vuelos) {
    if (vuelos == true) {
      this.permisos.vuelos = 1;
    }
    if (vuelos == false) {
      this.permisos.vuelos = 0;
    }
  }
  viewAllReservas = function (all_reservas) {
    if (all_reservas == 1) {
      this.permisos.reservaciones_todas = 1;
    }
  }

}
