import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, ValidatorFn  } from '@angular/forms';
import { SweetalertService } from '@app/services/sweetalert.service';
import { CotizacionesService } from '@app/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-enviar-cotizacion',
  templateUrl: './enviar-cotizacion.component.html',
  styleUrls: []
})
export class EnviarCotizacionComponent {
    @Input() data;
    @Input() ids;
    @Input() hoteles;
    submitted = false;
    loading = false;

    formCotizacion: FormGroup;
    /* ids: string = '';
    hoteles: any = []; */

    constructor (
        public activeModal: NgbActiveModal,
        private formBuilder: FormBuilder,
        private swal: SweetalertService,
        private cotizacionesService: CotizacionesService,
        private router: Router
    ) {
        this.formCotizacion = this.formBuilder.group({
            dirigido: ['', Validators.required],
            email: ['', Validators.email],
            observaciones: [''],
            cotizaciones: [''],
            hoteles: [''],
            descuento: [''],
            montoextra: [''],
        });
    }
    
    ngOnInit() {
    
        this.formCotizacion.patchValue({
            cotizaciones: this.ids,
            hoteles: this.hoteles,
            descuento: this.data.descuento,
            montoextra: this.data.montoextra
        })
    }

    get f() { return this.formCotizacion.controls; }

    guardarCotizacion() {
        this.submitted = true;
        this.loading = true;
        
        if (this.formCotizacion.invalid) {
            return;
        }
        
        this.cotizacionesService.saveCotizacion(this.formCotizacion.value).subscribe(r => {
            this.loading = false;
            // this.swal.alert(response.title, response.msg)
            this.activeModal.dismiss();
            switch (r.status) {
                case 'success':
                  this.swal.success(r.title, r.msg);
                  localStorage.removeItem('cotizaciones');
                  this.router.navigate(['/cotizaciones']);
                  break;
                case 'warning':
                  this.swal.warning(r.title, r.msg);
                  break;
                case 'error':
                  this.swal.error(r.title, r.msg);
                  break;
                default:
                  this.swal.info(r.title, r.msg);
                  localStorage.removeItem('cotizaciones');
                  this.router.navigate(['/cotizaciones']);
                  break;
            }
        })
        
    }
    
}
