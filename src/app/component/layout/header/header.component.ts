import { Component, OnInit, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { Router, RouterLinkActive } from '@angular/router';
import { AuthenticationService, UserService, AgenciaService, SharedService, ThemeService, CotizacionesService } from '@app/services';
import { User } from '@app/models';
import { FirebaseService } from '@app/services/firebase/firebase.service';
import { IframeheaderComponent } from './iframeHeader.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: [],
})

export class HeaderComponent implements OnInit {
  @ViewChild('toggleButton', { static: true }) toggleButton: ElementRef;
  @ViewChild('sidebar', { static: true }) sidebar: ElementRef;
    sidebarStatus = true;
    currentUser: User;
    agencia;
    user;
    currencies = [];
    innerWidth: any;
    cotizaciones_novistas;
    idOperador;
    actualLang:string;
    constructor(
        private modalService: NgbModal,
        public authenticationService: AuthenticationService,
        public router: Router,
        public userService: UserService,
        public sharedService: SharedService,
        private fs: FirebaseService,
        private themeService: ThemeService,
        public agenciaService: AgenciaService,
        public cotizacionesService: CotizacionesService,
        private renderer: Renderer2,
        private translate: TranslateService
    ) {
        let iduser = localStorage.getItem('access_user');
        let idagencia = localStorage.getItem('access_agen');
        this.fs.currencies.subscribe(data => {
            var curr = [];
            Object.keys(data).forEach(function (key) {
                curr.push(data[key]);
            });
            this.currencies = curr;
        });
        this.userService.getUser(iduser).subscribe(user => {
            this.sharedService.setUsuario(user);
            this.user = user;
            if(this.user.producto_comisiones.length > 0){
                this.user.producto_comisiones[10].comision = 2.5
            }
        });
        this.agenciaService.getAgencia(idagencia).subscribe(agencia => {
            this.sharedService.setAgencia(agencia);
            this.agencia = agencia;
        });
        this.themeService.getColor().subscribe(r => {
            this.themeService.setActiveTheme(JSON.parse(localStorage.getItem('theme')));
        });
        this.cotizacionesService.getCotizacionesPaginadas(0,25).subscribe((response) => {
            this.cotizaciones_novistas = response.nuevas;
            this.cotizacionesService.setCotizacionesNoVistas(this.cotizaciones_novistas);
            this.cotizacionesService.getCotizacionesNoVistas().subscribe((r) => {
                this.cotizaciones_novistas = r;
            });
        });
        this.authenticationService.getLang().subscribe(res=>{
            this.actualLang = res;
            translate.setDefaultLang(res);
        });
    }

    ngOnInit() {
        this.idOperador = localStorage.getItem('access_ope');
        this.innerWidth = window.innerWidth;
        if (this.innerWidth <= 991) {
            // this.sidebarStatus = true;
            this.renderer.listen('window', 'click', e => {
                if (e.path.indexOf(this.toggleButton.nativeElement) === -1) {
                    this.sidebarStatus = true;
                }
            });
        } else {
            // this.sidebarStatus = false;
        }
    }

    collapseSidebar() {
        this.sidebarStatus = !this.sidebarStatus;
    }
    
    closeSidebar() {
        this.sidebarStatus = true;
    }

    logout() {
        this.authenticationService.logout();
        this.sharedService.setUsuario({
            agencia: '',
            email: '',
            name: '',
            nombre: '',
            status: 0,
            nomAgencia: '',
            usuario: '',
        });
        // this.sharedService.setIdEmpresa(null);
        setTimeout(() => {
            localStorage.clear();
            this.router.navigate(['/login']);
        }, 2500);
    }

    
  Iframe() {
    const modalRef = this.modalService.open(IframeheaderComponent, {size:'lg'});
  
  }

  setLang(lang){
    this.authenticationService.setLang(lang);
    this.translate.setDefaultLang(lang);
  }
}
