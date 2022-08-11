import { Component, OnInit, Input, ViewChild  } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GalleryItem, ImageItem } from '@ngx-gallery/core';
import { GoogleMap } from '@angular/google-maps'


@Component({
  selector: 'app-info-hotel-u',
  templateUrl: './info-hotel-u.component.html',
  styleUrls: []
})
export class InfoHotelUComponent implements OnInit {
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

  ngOnInit(){
    this.informacionHotel = this.infoHoteljson.hotel;
    let gallery = this.infoHoteljson.gallery;
    let itemes = [];
  
    gallery.forEach(item => {
      var imgGaleria = item.url;
      itemes.push(new ImageItem({ src: imgGaleria, thumb: imgGaleria }));
    });
    this.images = itemes;
    this.center.lat = this.informacionHotel.location.latitude;
    this.center.lng = this.informacionHotel.location.longitude;
  }

  closeModal() {
    this.activeModal.close('Modal Closed');
  }

}
