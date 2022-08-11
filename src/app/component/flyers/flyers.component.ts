import { Component, OnInit } from '@angular/core';
import { FlyersService, AuthenticationService, ConfigService } from '@app/services';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-flyers',
  templateUrl: './flyers.component.html',
  styleUrls: [],
})
export class FlyersComponent implements OnInit {
  idOpe: string;
  currentUser;
  token;
  listFlyersSection = [];
  today = new Date(Date.now());
  imgruta;
  anuncios = ConfigService.configFile.anuncios;
  idOperador = ConfigService.configFile.idOperador;
  anuncio1;
  link1;
  constructor(
    private flyersService: FlyersService,
    private authenticationService: AuthenticationService,
    private spinnerService: NgxSpinnerService,
    private translate: TranslateService
  ) {
    this.imgruta='./assets/img/spinners/general.gif?'+this.today;
    this.authenticationService.getLang().subscribe(res=>{
      translate.setDefaultLang(res);
    });
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.idOpe = this.currentUser.userData.idOperador;
  }

  ngOnInit() {
    // this.spinnerService.show();
    // this.idOpe = localStorage.getItem('access_ope');
    this.token = localStorage.getItem('access_token');
    this.getFlyers();
    var operador;
    if(
        this.idOperador == "AZAMID" && this.idOpe == "AZAMID" ||
        this.idOperador == "AZAMID" && this.idOpe == "AZAMTY" ||
        this.idOperador == "AZAMID" && this.idOpe == "AZAMX"
    ){
        operador = "AZAMID";
        this.link1 = ConfigService.configFile.anuncios[operador].principal;
        this.anuncio1 = './assets/img/anuncio1_'+operador+'.jpg';
    }else if( 
        (
            this.idOperador == "AZABR" && this.idOpe == "AZABR"
        ) || this.idOpe == "AZABR" || this.idOpe == "AZALTM"  || this.idOpe == "AZACR" || this.idOpe == "AZAPTY"
    ){
        operador = this.idOpe;
        this.link1 = ConfigService.configFile.anuncios[operador].principal;
        this.anuncio1 = './assets/img/anuncio1_'+operador+'.jpg';
    }else{
        this.link1 = ConfigService.configFile.anuncios.principal;
        this.anuncio1 = './assets/img/anuncio1.jpg';
    }
  }

  getFlyers() {
    this.flyersService.getFlyers(this.idOpe).subscribe((response) => {
      if(response){
        this.listFlyersSection = response;
        this.listFlyersSection[0].active = true;
        setTimeout(() => {
          this.spinnerService.hide();
        }, 1000);
      }
    });
  }

  setActive(flyer) {
    for (let flyers of this.listFlyersSection) {
      flyers.active = false;
    }
    flyer.active = true;
  }
}
