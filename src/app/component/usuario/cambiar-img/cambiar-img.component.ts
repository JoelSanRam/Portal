import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SweetalertService } from '../../../services/sweetalert.service';
import { UserService } from '../../../services';


@Component({
  selector: 'app-cambiar-img',
  templateUrl: './cambiar-img.component.html',
  styleUrls: []
})
export class CambiarImgComponent implements OnInit {
  @Input() data;
  envioForm: FormGroup;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper = false;
  showSave = false;
  imgPerfil;
  loading = false;
  @ViewChild(ImageCropperComponent, { static: true }) imageCropper: ImageCropperComponent;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private swal: SweetalertService, 
    private userService: UserService, 
  ) { }

  ngOnInit() {
    this.envioForm = this.formBuilder.group({
       
    });
  }

  setFormValue(data: any) {
    //console.info('esto es el data',data);
    this.envioForm.setValue(data);
  }

  subirImg(data: any){
    this.imgPerfil = {
      'fotoperfil': data
    }
    // console.info(data);
    this.loading = true;
    this.userService.changeImg(this.imgPerfil)
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

  // rotateLeft() {
  //   this.imageCropper.rotateLeft();
  // }
  // rotateRight() {
  //   this.imageCropper.rotateRight();
  // }
  // flipHorizontal() {
  //   this.imageCropper.flipHorizontal();
  // }
  // flipVertical() {
  //   this.imageCropper.flipVertical();
  // }

}
