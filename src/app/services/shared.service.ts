import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario, Agencia } from '../../app/models';

@Injectable({ providedIn: 'root' })
export class SharedService {
    private usuarioSubject: BehaviorSubject<Usuario>;
    public usuarioObserver: Observable<Usuario>;
    public usuario: Usuario = {
        id: 0,
        uid: 0,
        agencia: '',
        email: '',
        name: '',
        nombre: '',
        status: 0,
        nomAgencia: '',
        usuario: ''
    };
    private agenciaSubject: BehaviorSubject<Agencia>
    public agenciaObserver: Observable<Agencia>
    public agencia: Agencia = {
        id: 0,
        nomAgencia: '',
        agencia_logobanner: '',
        agencia_logodocs: '',
        agencia_pie: '',
        aoPass: '',
        aoUser: '',
        celular: 0,
        ciudad: '',
        currency: '',
        dirAgencia: '',
        direccionFiscal: '',
        estado: '',
        fecha_registro: '',
        idAgencia: 0,
        id_agencia: '',
        pais: '',
        razonSocial: '',
        redSocial: '',
        rfc: '',
        telefono: 0,
        utilidad: 0,
        servicios:'',
    }
    private paramsBusquedaHotelSubject;
    private paramsBusquedaHotel;

    private paramsBusquedaTraciturSubject;
    private paramsBusquedaTracitur;

    // private filtrosSubject;
    private filtros = {
        'brokers':[],
        'categorias':[],
        'hotel':'',
        'order':'',
        'planes':[]
    };
    // private filtros = [];
    constructor() {
        this.usuarioSubject = new BehaviorSubject<Usuario>(this.usuario);
        this.usuarioObserver = this.usuarioSubject.asObservable();
        this.agenciaSubject = new BehaviorSubject<Agencia>(this.agencia);
        this.agenciaObserver = this.agenciaSubject.asObservable();
        this.paramsBusquedaHotelSubject = new BehaviorSubject<any>("");
        this.paramsBusquedaHotel = this.paramsBusquedaHotelSubject.asObservable();
        this.paramsBusquedaTraciturSubject = new BehaviorSubject<any>("");
        this.paramsBusquedaTracitur = this.paramsBusquedaTraciturSubject.asObservable();

        // this.filtrosSubject = new BehaviorSubject<any>([]);
        // this.filtros = this.filtrosSubject.asObservable();
    }
    setUsuario(user) {
        this.usuarioSubject.next(user);
    }
    setAgencia(agencia) {
        this.agenciaSubject.next(agencia);
    }
    setParamsBusquedaHotel(params){
        this.paramsBusquedaHotelSubject.next(params);
    }
    getParamsBusquedaHotel(){
        return this.paramsBusquedaHotel;
    }

    //params de tracitur
    setParamsBTracitur(params){
        this.paramsBusquedaTraciturSubject.next(params);
    }
    getParamsBTracitur(){
        return this.paramsBusquedaTracitur;
    }

    setFiltrosHotel(filtro){
        // this.filtrosSubject.next(filtro);
        if(filtro.planes!=''){
            this.filtros.planes=filtro.planes;
        }
        if(filtro.categorias != ''){
            this.filtros.categorias=filtro.categorias;
        }
        if(filtro.brokers!=''){
            this.filtros.brokers=filtro.brokers;
        }
        if(filtro.hotel!=''){
            this.filtros.hotel=filtro.hotel;
        }
        if(filtro.order!=''){
            this.filtros.order=filtro.order;
        }
        this.filtros
    }

    getFiltroHotel(){
        return this.filtros;
    }
}
