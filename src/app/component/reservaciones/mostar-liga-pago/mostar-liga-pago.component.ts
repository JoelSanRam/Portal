import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SweetalertService } from '@app/services';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-mostar-liga-pago',
  templateUrl: './mostar-liga-pago.component.html',
  styleUrls: ['./mostar-liga-pago.component.sass']
})
export class MostarLigaPagoComponent implements OnInit {
  @Input() liga;
  urlSafe: SafeResourceUrl;
  constructor(  private modalService: NgbModal,
                public activeModal: NgbActiveModal,
                public sanitizer: DomSanitizer,
                public sweetAlertService: SweetalertService) { }

  ngOnInit(): void {
    
    this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.liga);
  }


  copyToClipboard(url: string){
    var copyElement = document.createElement("textarea");
    copyElement.style.position = 'fixed';
    copyElement.style.opacity = '0';
    copyElement.textContent =  decodeURI(url);
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(copyElement);
    copyElement.select();
    document.execCommand('copy');
    body.removeChild(copyElement);

    this.sweetAlertService.success(
      'Exito',
      '¡Texto copiado al portapapeles!'
    );
  }

}
