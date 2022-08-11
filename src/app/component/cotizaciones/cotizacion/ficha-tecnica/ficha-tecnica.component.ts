import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-ficha-tecnica',
  templateUrl: './ficha-tecnica.component.html',
  styleUrls: []
})
export class FichaTecnicaComponent {
  @Input() fichaTecnica;

  constructor(public activeModal: NgbActiveModal) {}

}
