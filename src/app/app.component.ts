import { Component, Injectable, ViewEncapsulation } from '@angular/core';
import { AuthenticationService, SessionService, SharedService } from "@app/services";
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { LottieService } from './services/lottie.service';
import { ConfigService } from './services/config.service';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['../assets/scss/principal.scss'],
  encapsulation: ViewEncapsulation.None
})
@Injectable({
  providedIn: 'root'
})
export class AppComponent {
  title
  session;
  permisosesion = 0;
  // rutaActiva;
  pathLoader;
  options: AnimationOptions;


  styles: Partial<CSSStyleDeclaration> = {
    maxWidth: '1000px',
  };
  showLoader: boolean;
  textLoader: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private SessionService: SessionService,
    private spinnerService: NgxSpinnerService,
    public authenticationService: AuthenticationService,
    public sharedService: SharedService,
    private lottieService: LottieService
  ) {

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        // Show loading indicator
        this.SessionService.session().subscribe(user => {
          /* this.session = user;
          console.info('hola soy las sesion',this.session); */
        });
        this.SessionService.getSession().subscribe(response => {
          if (response) {
            let permisosdecode = JSON.parse(response);
            this.permisosesion = permisosdecode.closession;
            if (this.permisosesion == 1) {
              this.spinnerService.show();
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
                this.spinnerService.hide();
                this.router.navigate(['/login']);
              }, 2500);
            }
          }
        });
      }

      if (event instanceof NavigationEnd) {
        // Hide loading indicator
        /* this.SessionService.session().subscribe(user => {
      }); */
      }

      if (event instanceof NavigationError) {
        // Hide loading indicator
        // Present error to user
        // console.log(event.error);
      }
    });
    this.authenticationService.setLang('');
  }

  ngOnInit() {
    var OPE;
    if (localStorage.getItem('access_ope') !== null) {
      OPE = localStorage.getItem('access_ope');
      /* this.router.events.subscribe((event) => {
      }); */
    } else {
      OPE = 'DEFAULT';
    }
    this.lottieService.getLoader().subscribe(options => {
      this.showLoader = options.show;
      this.textLoader = options.text;

    })
    // this.authenticationService.getConfigOperador(OPE).subscribe(r=>{
    // console.log(JSON.parse(localStorage.getItem('config')));
    // });

    
      this.authenticationService.getTypeLoader().subscribe((res) =>{
        if(res != undefined){
          this.options = {
            path: res.url
          };
        }
        // console.log("options", this.options);
      });

  }
}
