import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-galeria-fotos',
  templateUrl: './galeria-fotos.component.html',
  styleUrls: []
})
export class GaleriaFotosComponent implements OnInit {
  @Input() hotel;
  selectedImg = [];
  mensaje='La galería de imágenes se encuentra vacía, esta situación es responsabilidad del proveedor, lamentamos mucho los inconvenientes.';
  vermensaje=false;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    let contadorimg=this.hotel.ficha_tecnica.imagenes.length;
    if(contadorimg>0){
      this.vermensaje=true;
    }
    if(typeof this.hotel.img_selected != 'undefined') {
      for (const s of this.hotel.img_selected) {
        s.selected = true;
      }
      this.selectedImg = this.hotel.img_selected;
    }
  }

  selectImg (foto) {
    foto.selected =! foto.selected;
    if (foto.selected){
      this.selectedImg.push(foto);
    } else {
      let index = this.selectedImg.indexOf(foto);
      this.selectedImg.splice(index, 1);
    }
    return;
  }

  saveChanges () {
    this.activeModal.close(this.selectedImg);
  }

}
