import { Component, OnInit } from '@angular/core';
import { UserService, AuthenticationService } from '../../services';
import { SharedService } from '../../services/shared.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModificarPerfilComponent } from "./modificar-perfil/modificar-perfil.component";
import { CambiarImgComponent } from "./cambiar-img/cambiar-img.component";
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-usuario',
    templateUrl: './usuario.component.html',
    styleUrls: []
})
export class UsuarioComponent implements OnInit {
    currentUser;
    userId: any;
    user;
    agencia;
    today = new Date(Date.now());
    imgruta;
  
    constructor(
        private userService: UserService,
        private authenticationService: AuthenticationService,
        private sharedService: SharedService,
        private modalService: NgbModal,
        private spinnerService: NgxSpinnerService,
        private translate: TranslateService
    ) {
        this.sharedService.usuarioObserver.subscribe(user => {
            this.user = user;
        });
        this.sharedService.agenciaObserver.subscribe(agencia => {
            this.agencia = agencia;
        });
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
        this.userId = localStorage.getItem('access_user');
        this.imgruta='../../../assets/img/spinners/general.gif?'+this.today;
        this.authenticationService.getLang().subscribe(res=>{
            translate.setDefaultLang(res);
        });
    }
  

    ngOnInit() {    
        this.spinnerService.show();
        this.getUser();
    }

    getUser() {
        this.userService.getUser(this.userId).subscribe(user => {
            this.sharedService.setUsuario(user);
            this.user = user;
            this.spinnerService.hide();
        });
    }

    modificarPerfil() {
        const modalRef = this.modalService.open(ModificarPerfilComponent, {backdrop:'static'});
        modalRef.result.then((result) => {
            this.getUser();
        }).catch((error) => {
        });
    }

    modificarImage() {
        const modalRef = this.modalService.open(CambiarImgComponent, {backdrop:'static'});
        modalRef.result.then((result) => {
            this.getUser();
        }).catch((error) => {
        });
    }

    public barChartOptions = {
        scaleShowVerticalLines: false,
        responsive: true,
        barRoundness: 1,
        scales: {
        xAxes: [{
            gridLines: {
                display:false
            }
        }],
        yAxes: [{
            gridLines: {
                display:false
            }   
        }]
        }
    };
    public barChartLabels = ['Hoteleria', 'Actividades', 'Circuitos', 'Traslados', 'Cruceros', 'Aéreos', 'Seguros', 'Grupos', 'Bodas'];
    public barChartType = 'bar';
    public barChartLegend = false;
    public barChartData = [
        {data: [722, 320, 442, 108, 0, 0, 260, 406, 301], label: 'Series A'},
    ];
    public barChartColors: any[] = [
        { 
        backgroundColor:["#009beb", "#ff8500", "#ffcd54", "#0de1c5", "#000000", "#000000", "#b95bd4", "#fe2c2b", "#00d2df"] 
        }
    ];

}
