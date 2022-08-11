import { Injectable } from '@angular/core';
import swal, { SweetAlertOptions } from "sweetalert2";

export type SweetAlertType = 'success' | 'error' | 'warning' | 'info' | 'question';
export interface ConfirmOptions {
  title?: string;
  text?: string;
  type?: SweetAlertType | 'info';
  showCancelButton?: boolean;
  confirmButtonColor?: string; // = '#E84042';
  cancelButtonColor?: string; // = '#F7FBFE';
  confirmButtonText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SweetalertService {
    list;
    constructor() { }
    alert($title = '', $msg = '', $status = '') {
        let title = '';
        let msg = '';
        let statusIcon = '';
        let swalHtml = '';
        if ($title !== '' && $title !== null) {
            title = '<div class="sw-alert-title text-sm-left text-xs-center">'.concat($title).concat('</div>');
        }
        if ($msg !== '' && $msg !== null) {
            msg = '<div class="sw-alert-msg text-sm-left text-xs-center">'.concat($msg).concat('</div>');
        }
        switch ($status) {
            case 'success':
                statusIcon = '';
                break;
            case 'info':
                statusIcon = '';
                break;
            case 'warning':
                statusIcon = '';
                break;
            case 'error':
                statusIcon = '';
                break;
            case 'question':
                statusIcon = '';
                break;
            default:
                statusIcon = '';
                break;
        }
        if (statusIcon !== '') {
            swalHtml = '<div class="row"><div class="col-xs-12 col-sm-4 d-flex align-self-stretch align-items-center justify-content-center sw-alert-icon">'.concat(statusIcon).concat('</div><div class="col-xs-12 col-sm-8 d-flex flex-column justify-content-center">').concat(title).concat(msg).concat('</div></div>');
        } else {
            swalHtml = '<div class="row">'.concat('<div class="col-12 d-flex flex-column justify-content-center">').concat(title).concat(msg).concat('</div></div>');
        }
        swal.fire({
            html: swalHtml,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#E84042'
        });
    }
    success($title = '', $msg = '') {
        swal.fire({
            title: $title,
            html: '<div>'+$msg+'</div>',
            type: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#E84042'
        });
    }
    warning($title = '', $msg = '') {
        swal.fire({
            title: $title,
            html: $msg,
            type: 'warning',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#E84042'
        });
    }
    error($title = '', $msg = '', data = null) {
        let title = '';
        let msg = '';
        if ($title !== '' && $title !== null) {
            title = $title;
        }
        if ($msg !== '' && $msg !== null) {
            msg = '<div class="text-center">'.concat($msg).concat('</div>');
        }
        swal.fire({
            type: 'error',
            title: title,
            html: msg,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#E84042'
        });
    }
    info($title = '', $msg = '') {
        let title = '';
        let msg = '';
        
        if ($title !== '' && $title !== null) {
            title = $title;
        }
        if ($msg !== '' && $msg !== null) {
            msg = '<div class="text-center">'.concat($msg).concat('</div>');
        }
        swal.fire({
            title: title,
            html: msg,
            type: 'info',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#E84042'
        });
     }
    question($title = '', $msg = '') {
        let title = '';
        let msg = '';
        let statusIcon = '';
        let swalHtml = '';
        if ($title !== '' && $title !== null) {
            title = '<div class="sw-alert-title text-sm-left text-xs-center">'.concat($title).concat('</div>');
        }
        if ($msg !== '' && $msg !== null) {
            msg = '<div class="sw-alert-msg text-sm-left text-xs-center">'.concat($msg).concat('</div>');
        }
        statusIcon = '<div class="swal2-icon swal2-question swal2-animate-question-icon" style="display: flex;"><span class="swal2-icon-text">?</span></div>';
        swalHtml = '<div class="row"><div class="col-xs-12 col-sm-4 d-flex align-self-stretch align-items-center justify-content-center sw-alert-icon">'.concat(statusIcon).concat('</div><div class="col-xs-12 col-sm-8 d-flex flex-column justify-content-center">').concat(title).concat(msg).concat('</div></div>');
        swal.fire({
            html: swalHtml,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#E84042'
        });

    }
    toast($text = '', $type: SweetAlertType = 'success') {
        const toast = swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            title: '',
            timer: 3000
        });
        toast.fire({
            type: $type,
            text: $text
        });
    }
    toastFull($title = '', $text = '', $type: SweetAlertType = 'success') {
        const toast = swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            title: $title,
            timer: 3000
        });
        toast.fire({
            type: $type,
            title: $title,
            text: $text
        });
    }
    confirm(options: ConfirmOptions, callback: (result) => void) {
        // console.info('callback',callback);
        swal.fire({
            title: options.title,
            html: options.text,
            type: options.type,
            showCancelButton: options.showCancelButton || true,
            confirmButtonColor: '#E84042',
            cancelButtonColor: '#bdc3c7',
            confirmButtonText: options.confirmButtonText
        }).then((result) => {
            if (result.value) {
                callback(result.value);
            }
        });
    }
    progress($title = '', $text = ''){
        let title = '';
        let text = '';
       
        if ($title !== '' && $title !== null) {
            title = $title;
        }
        if ($text !== '' && $text !== null) {
            text = $text;
        }
        swal.fire({
            title: title,
            html: text,
            allowOutsideClick: false,
            onBeforeOpen: () => {
                swal.showLoading()
                // timerInterval = setInterval(() => {swal.getContent().querySelector('b').textContent = swal.getTimerLeft()}, 100)
            }
        });
    }
    closeSwal(){
        swal.close();
    }
}
