import { Component, OnInit, NgModule } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService, AlertService, ConfigService } from '@app/services';
import { SweetalertService } from '../../services/sweetalert.service';
import { first } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: [],
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    token;
    private idOperador = ConfigService.configFile.idOperador;
    rsociales = ConfigService.configFile.redes_sociales;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService,
        public sweetAlertService: SweetalertService,
        private translate: TranslateService
    ) {
        this.authenticationService.getLang().subscribe(res=>{
            translate.setDefaultLang(res);
        });
    }

    ngOnInit() {
        this.token = this.authenticationService.currentToken;
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
        });
        // this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

    }
    get f() {
        return this.loginForm.controls;
    }
    onSubmit() {
        this.submitted = true;
        if (this.loginForm.invalid) {
            var title;
            var msg;
            this.translate.get('login.error-login').subscribe((data:any)=> { title = data;});
            this.translate.get('login.datos-incorrectos').subscribe((data:any)=> { msg = data;});
            this.sweetAlertService.error( title, msg );
            return;
        }
        this.loading = true;
        this.authenticationService
            .login(this.f.username.value, this.f.password.value, this.idOperador)
            .pipe(first())
            .subscribe(
                (data) => {
                    if (data.status == 'error') {
                        this.sweetAlertService.error(data.title, data.message);
                        this.loading = false;
                    } else {
                        this.router.navigate(['/home']);
                    }
                },
                (error) => {
                    this.alertService.error(error.msg);
                    this.loading = false;
                }
            );
    }

    setLang(lang){
        this.authenticationService.setLang(lang);
        this.translate.setDefaultLang(lang);
    }
}
