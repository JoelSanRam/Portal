import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SweetalertService } from '../../../services/sweetalert.service';
import { AgenciaService } from "../../../services";

@Component({
  selector: 'app-cambiar-logo-docs',
  templateUrl: './cambiar-logo-docs.component.html',
  styleUrls: []
})
export class CambiarLogoDocsComponent implements OnInit {
  @Input() data;
  envioForm: FormGroup;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper = false;
  showSave = false;
  logoDocs;
  loading = false;
  @ViewChild(ImageCropperComponent, { static: true }) imageCropper: ImageCropperComponent;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private swal: SweetalertService,
    private agenciaService: AgenciaService,
  ) { }

  ngOnInit() {
    this.envioForm = this.formBuilder.group({
    });
  }

  setFormValue(data: any) {
    this.envioForm.setValue(data);
  }

  subirImg(data: any){
    this.logoDocs = {
      'img': data
    }
    this.loading = true;
    this.agenciaService.changeLogoDocs(this.logoDocs)
      .subscribe( data => {
        this.loading = false;
        // this.swal.toast(data.msg);
        this.swal.success(data.title, data.msg);
        this.activeModal.close('Modal Closed');
      },
      error => {
        this.loading = false;
        // this.swal.toast('Error intentelo de nuevo mas tarde','error');
        this.swal.error(data.title, data.msg);
      });
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.showSave = true;
  }

  imageLoaded() {
    this.showCropper = true;
  }

  cropperReady() {}

  loadImageFailed () {}

}
