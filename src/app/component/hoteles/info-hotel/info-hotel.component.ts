// import { GoogleMapsAPIWrapper } from '@agm/core';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GalleryItem, ImageItem } from '@ngx-gallery/core';
import { GoogleMap } from '@angular/google-maps'


@Component({
  selector: 'app-info-hotel',
  templateUrl: './info-hotel.component.html',
  styleUrls: []
})
export class InfoHotelComponent implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap
  @Input() infoHoteljson;
  datosjson;
  informacionHotel;
  images: GalleryItem[];
  //maps parameters
  center = {
    lat:0,
    lng:0
  };
  zoom = 15;
  display?: google.maps.LatLngLiteral;
  options = { animation: google.maps.Animation.BOUNCE };
  constructor(
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.informacionHotel = this.infoHoteljson;
    let gallery = this.infoHoteljson.imagenes;
    let itemes = [];
    gallery.forEach(item => {
      itemes.push(new ImageItem({ src: item.path, thumb: item.path }));
    });
    this.images = itemes;
    this.center.lat = this.informacionHotel.mapa.latitud;
    this.center.lng = this.informacionHotel.mapa.longitud;
  }

  closeModal() {
    this.activeModal.close('Modal Closed');
  }

}
