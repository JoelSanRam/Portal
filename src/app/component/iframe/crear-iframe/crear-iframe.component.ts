import { FormGroup, FormBuilder, Validators, FormControl, FormArray, MaxLengthValidator } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SharedService, AgenciaService, SweetalertService, IframeService } from '@app/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UsuarioFormComponent } from '@app/component/agencia/usuario-form/usuario-form.component';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-crear-iframe',
  templateUrl: './crear-iframe.component.html',
  styleUrls: []
})
export class CrearIframeComponent implements OnInit {
  id;
  iframeForm: FormGroup;
  submitted = false;
  loading = false;
  agencia;
  // colores;
  usuariosList;
  usuarios;
  newUsuario = {
    nombre: '',
    usuario: '',
    tipousuario: 'Agente',
  };
  code = '';

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private agenciaService: AgenciaService,
    private modalService: NgbModal,
    private swal: SweetalertService,
    private iframeService: IframeService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
  ) {
    this.iframeForm = this.fb.group({
      name: ['', Validators.required],
      url_resultado: ['', Validators.required],
      position: ['', Validators.required],
      background: ['', Validators.required],
      bestprice: ['', Validators.required],
      colors: this.fb.group({
        buscador: this.fb.group({
          fondo: ['', Validators.required],
          texto: ['', Validators.required]
        }),
        filtro: this.fb.group({
          fondo: ['', Validators.required],
          texto: ['', Validators.required]
        }),
        botones: this.fb.group({
          buscar: this.fb.group({
            fondo: ['', Validators.required],
            texto: ['', Validators.required]
          }),
          reservar: this.fb.group({
            fondo: ['', Validators.required],
            texto: ['', Validators.required]
          }),
          cotizar: this.fb.group({
            fondo: ['', Validators.required],
            texto: ['', Validators.required]
          }),
        }),
      }),
      classWidth: ['', Validators.required],
      modulos: this.fb.group({
        hoteles: ['', Validators.required],
        tours: ['', Validators.required],
        traslados: ['', Validators.required],
        circuitos: ['', Validators.required],
        vuelos: ['', Validators.required],
      }),
      mkp: ['', Validators.required],
      loader: this.fb.group({
        url: [''],
        texto: ['', Validators.maxLength(100)]
      }),
      usuario: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.sharedService.agenciaObserver.subscribe(agencia => this.agencia = agencia);
    this.getUsuarios();
    if (this.id !== null) {
      this.getIframe(this.id);
    } else {
      this.iframeForm.patchValue({
        position: 'H',
        background: '#f3f3f3',
        bestprice: 'D',
        classWidth: 'container',
        colors: {
          buscador: {
            fondo: '#FFFFFF',
            texto: '#000000',
          },
          filtro: {
            fondo: '#009AE8',
            texto: '#FFFFFF',
          },
          botones: {
            buscar: {
              fondo: '#ED3030',
              texto: '#FFFFFF',
            },
            reservar: {
              fondo: '#009AE8',
              texto: '#FFFFFF',
            },
            cotizar: {
              fondo: '#4CDEC2',
              texto: '#FFFFFF',
            },
          },
        },
        modulos: {
          hoteles: true,
          tours: false,
          traslados: false,
          circuitos: false,
          vuelos: false,
        },
        mkp: '0',
      });
    }

  }

  get f() { return this.iframeForm.controls; }
  get c() { return (this.iframeForm.get('colors') as FormGroup).controls; }


  getUsuarios() {
    this.agenciaService.getUsuarios(this.agencia.idAgencia).subscribe(res => {
      this.usuariosList = res;
    });
  }

  getIframe(id) {
    this.iframeService.getIframe(id).subscribe(r => {
      const c = r.colors;
      const wc = r.classWidth;
      this.iframeForm.patchValue({
        name: r.name,
        position: r.position,
        background: r.background,
        bestprice: r.bestprice,
        classWidth: r.classWidth,
        colors: {
          buscador: {
            fondo: c.buscador.fondo,
            texto: c.buscador.texto
          },
          filtro: {
            fondo: c.filtro.fondo,
            texto: c.filtro.texto
          },
          botones: {
            buscar: {
              fondo: c.botones.buscar.fondo,
              texto: c.botones.buscar.texto
            },
            reservar: {
              fondo: c.botones.reservar.fondo,
              texto: c.botones.reservar.texto
            },
            cotizar: {
              fondo: c.botones.cotizar.fondo,
              texto: c.botones.cotizar.texto
            }
          }
        },
        modulos: {
          hoteles: r.modulos.hoteles,
          tours: r.modulos.tours,
          traslados: r.modulos.traslados,
          circuitos: r.modulos.circuitos,
          vuelos: r.modulos.vuelos,
        },
        mkp: r.mkp,
        loader: {
          url: r.loader.url,
          texto: r.loader.texto
        },
        usuario: r.usuario,
        url_resultado: r.url_resultado
      });

      this.code = r.codigo
      // this.generarIframe(this.iframeForm.value);
    });
  }

  modalUsuarioForm(usuario) {
    const modalRef = this.modalService.open(UsuarioFormComponent, { backdrop: 'static' });
    modalRef.componentInstance.usuario = usuario;
    modalRef.result.then((result) => {
      this.getUsuarios();
    });
  }

  validForm() {
    var iframe;
    this.translate.get('hotel.realizando-reservacion').subscribe((data: any) => {
      iframe
      = data;
    });
    this.submitted = true;
    if (this.iframeForm.invalid) {
      this.swal.warning('', iframe);
      return;
    }

    if (this.id !== null) {
      this.editIframe(this.id, this.iframeForm.value);
    } else {
      this.saveIframe(this.iframeForm.value);
    }
  }

  editIframe(id, params) {
    params.id = id;
    this.iframeService.editIframe(params).subscribe(r => {
      this.swal.alert(r.title, r.msg, r.status);
      // this.code = r.data.codigo;
    });
    // this.generarIframe(params);
  }

  saveIframe(params) {
    this.iframeService.saveIframe(params).subscribe(r => {
      this.swal.alert(r.title, r.msg, r.status);
      this.code = r.data.codigo;
      this.router.navigate(['/iframe/' + r.data.id]);
    });
    // this.generarIframe(params);
  }

  generarIframe(params) {
    this.agenciaService.getToken(this.iframeForm.value).subscribe(token => {
      this.code = token;
      if (typeof token === 'undefined') {
        this.swal.error('Error', 'Error de sistema inesperado.');
      }
    });
  }

  copyCode(code) {
    if (code.length) {
      // tslint:disable-next-line: no-string-literal
      navigator['clipboard'].writeText(code);
      this.swal.toast('Código copiado!');
    }
  }


}
