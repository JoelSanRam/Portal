import { Component, OnInit, Input} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';
import { AgenciaService, AuthenticationService, SharedService } from '@app/services';
import { SweetalertService } from '@app/services/sweetalert.service';
import { User, Agencia } from '@app/models';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-usuario-form',
  templateUrl: './usuario-form.component.html',
  styleUrls: []
})
export class UsuarioFormComponent implements OnInit {
  @Input() usuario;
  private currentUser: User;
  private idAgencia: number;
  // private idUsuario: number;
  agencia: Agencia;
  newUserForm: FormGroup;
  submitted = false;
  loading = false;
  noMatch = false;

  constructor(
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private agenciaService: AgenciaService,
    private authenticationService: AuthenticationService,
    private swal: SweetalertService,
    public activeModal: NgbActiveModal,
    private translate: TranslateService
  ) {
    this.newUserForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      email: ['', Validators.email],
      usuario: ['', Validators.required],
      pass: '',
      repeat: '',
      tipousuario: ['', Validators.required],
    });
    this.authenticationService.getLang().subscribe(res=>{
      translate.setDefaultLang(res);
    });
  }

  ngOnInit() {
    this.idAgencia = JSON.parse(localStorage.getItem('access_agen'));
    this.newUserForm.patchValue({
      nombre: this.usuario.nombre,
      email: this.usuario.email,
      usuario: this.usuario.usuario,
      tipousuario: this.usuario.tipousuario,
    });
  }

  get d() { return this.newUserForm.controls; }

  crearUsuario() {
    this.submitted = true;
    if (this.newUserForm.invalid) {
      return;
    }
    this.loading = true;
    if(this.usuario.uid) {
      this.agenciaService.editUsuario(this.idAgencia, this.usuario.uid, this.newUserForm.value).subscribe(res => {
        this.loading = false;
        this.swal.success(res.title, res.msg);
        this.activeModal.close('Modal Closed');
      },
      error => {
        this.loading = false;
        this.swal.error(error.title, error.msg);
      });
    } else {
      if (this.newUserForm.value.pass !==  this.newUserForm.value.repeat) {
        this.noMatch = true;
        return;
      }
      this.agenciaService.createUsuario(this.idAgencia, this.newUserForm.value).subscribe(res => {
        this.loading = false;
        this.swal.success(res.title, res.msg);
        this.activeModal.close('Modal Closed');
      },
      error => {
        this.loading = false;
        this.swal.error(error.title, error.msg);
      });
    }
  }
}
