import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators  } from "@angular/forms";
import { UserService } from '../../../services';
import { SharedService } from '../../../services/shared.service';
import { SweetalertService } from '../../../services/sweetalert.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
    selector: 'app-modificar-perfil',
    templateUrl: './modificar-perfil.component.html',
    styleUrls: []
})
export class ModificarPerfilComponent implements OnInit {
    user;
    userDataForm: FormGroup;
    name: string;
    email: string;
    usuario: string;
    anterior: string
    nueva: string
    repetir: string;
    submitted = false;
    loading = false;

    constructor(
        public activeModal: NgbActiveModal,
        private formBuilder: FormBuilder,
        private sharedService: SharedService,
        private userService: UserService,
        private swal: SweetalertService, 
        private translate: TranslateService
    ) {
        this.sharedService.usuarioObserver.subscribe(user => {
            this.user = user;
        });
        this.userDataForm = this.formBuilder.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            usuario: [{value: '', disabled: true}, Validators.required],
            anterior: [''],
            nueva: [''],
            repetir: [''],
        });
    }

    ngOnInit() {
        this.userDataForm.patchValue({
            name: this.user.name,
            email: this.user.email,
            usuario: this.user.usuario
        })
    }

    getUser() {
        this.userService.getUser(this.user.id).subscribe(user => {
          this.sharedService.setUsuario(user);
        });
      }

    get d() { return this.userDataForm.controls; }
    
    guardarPerfil() {
        var titulo;
        this.translate.get('tracitur.error-volver-intentar').subscribe((data: any) => { titulo = data; });
        var error;
        this.translate.get('tracitur.error').subscribe((data: any) => { error = data; });
        this.submitted = true;
        if (this.userDataForm.invalid) {
            return;
        }
        this.loading = true;
        if(this.userDataForm.value.anterior === "" || this.userDataForm.value.anterior === null){
            this.userService.savePerfil(this.userDataForm.value).subscribe(res => {
                // this.swal.toast(res.title);
                this.loading = false;
                this.getUser();
                this.swal.success(res.title, res.msg);
                this.activeModal.close('Modal Closed');
            },
            error => {
                this.loading = false;
                this.swal.error(titulo,error);
                // this.swal.error(res.title, res.msg);
            });
        }else{
            // if(this.userDataForm.value.nueva == this.userDataForm.value.repetir) {}
            this.userService.changePass(this.userDataForm.value).subscribe(res => {
                // this.swal.toast(res.title);
                this.loading = false;
                this.swal.success(res.title, res.msg);
                this.activeModal.close('Modal Closed');
            },
            error => {
                this.loading = false;
                this.swal.error(titulo,error);
                // this.swal.error(res.title, res.msg);
            });
        }
    }
}
