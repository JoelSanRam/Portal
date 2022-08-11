import { Component, OnInit } from '@angular/core';
import { AuthenticationService, SessionService, SharedService } from "@app/services";
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: []
})
export class LinksComponent implements OnInit {
  subscription: Subscription = new Subscription();
  ruta;
  //PERSMISOS DE LINKS TRASLADOS
  permisoshotel;
  permisostour;
  permisostraslados;
  permisoscircuitos;
  permisoVuelos;
  permisoshotelAgency;
  permisostourAgency;
  permisostrasladosAgency;
  permisoscircuitosAgency;
  permisoVuelosAgency;
  permisos = [];
  permisosAgency = [];
  permisosActive = [];
  rutaP = '';
  tabActive;
  serviciosAgencia;
  serviciosAgenciaP = [];
  constructor(
    private router: Router,
    private sharedService: SharedService,
    private sessionservice:SessionService,
    private auth : AuthenticationService,
    private translate: TranslateService
  ) { 
    this.ruta = router.url;
    //PERMISOS PARA LINKS
    this.sessionservice.getSession().subscribe(response=>{
      if(response){
        let permisosdecode=JSON.parse(response);
        this.permisoshotel=permisosdecode.hoteles;
        this.permisostour=permisosdecode.tours;
        this.permisostraslados=permisosdecode.traslados;
        this.permisoscircuitos=permisosdecode.circuitos;
        this.permisoVuelos = permisosdecode.vuelos;
      }
    });
    this.sharedService.agenciaObserver.subscribe(agencia => {
      this.serviciosAgencia = agencia.servicios;
      this.permisoshotelAgency = this.serviciosAgencia.hoteles;
      this.permisostourAgency = this.serviciosAgencia.tours;
      this.permisostrasladosAgency = this.serviciosAgencia.traslados;
      this.permisoscircuitosAgency = this.serviciosAgencia.circuitos;
      this.permisoVuelosAgency = this.serviciosAgencia.vuelos;
      this.serviciosAgenciaP.push(this.serviciosAgencia);
      this.permisosAgency.push(this.serviciosAgencia);
   
  
     
    });
    this.subscription.add(
      this.auth.currentUser.subscribe(res=>{
        if(res.userData.idAgencia == 11241){
          this.permisoVuelos = 1;
        }
      })
    );
    this.auth.getLang().subscribe(res=>{
      translate.setDefaultLang(res);
    });
  }

  ngOnInit() {
  }

}
