import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HotelService, SharedService, SweetalertService } from "@app/services";
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-filtros',
  templateUrl: './filtros.component.html',
  styles: []
})
export class FiltrosComponent implements OnInit {
  @Input() arrefil;
  @Input() tipo;

  @Output() valueChange = new EventEmitter();
  arregloprincipal = [];
  textomodal;
  filtrosplan = [];
  filtroscat = [];
  filtronombre = [];
  arreglocat = [];
  tipofiltro;
  filp;
  busqueda;
  resulthotel;
  rnumnoches;
  rnumhabs;
  arrplanes;
  arrcategoria;
  paginacion;
  arrnum;
  arrnum2 = [];
  ctrlHoteles = [];
  arrHotels;
  todosplan = true;
  todascat = true;
  preSelectedArray = [];
  constructor(
    private hotelService: HotelService,
    public activeModal: NgbActiveModal,
    public swal: SweetalertService,
    public sharedService: SharedService,
    private translate: TranslateService,
  ) {
  }

  ngOnInit() {
    var categoriasDisponibles;
    var planesDisponibles;
    this.translate.get('hotel.categorias-disponibles').subscribe((data: any) => { categoriasDisponibles = data; });
    this.translate.get('hotel.planes-disponibles').subscribe((data: any) => { planesDisponibles = data; });
    this.arregloprincipal = this.arrefil;

    var btnFiltros=this.hotelService.getBtnSearch();
    var all=[];
    if(btnFiltros===true){
      this.hotelService.setBtnSearch(false);
    }else{
      all = this.arregloprincipal.filter(element => element.selected == true);
    }
    if (all !== undefined && all.length!==0) {
      this.preSelectedArray=all;
      if(this.tipo == 1){
        this.todosplan = false;
      }else{

        this.todascat = false;
      }
    }
    if (this.tipo == 1) {
      this.textomodal = planesDisponibles;
    } else {
      this.textomodal = categoriasDisponibles;
    }
  }

  closeModal() {
    this.activeModal.close('Modal Closed');
  }

  changeplan() {
    this.arregloprincipal.forEach(element => {
      element.selected = false;
    });
  }

  checkCategorias(status, idCategoria) {
    for (let i of this.arregloprincipal) {
      if (i.idCategoria == idCategoria) {
        i.selected = status;
        this.preSelectedArray.push(i);
      }
    }
    this.todascat = false;
  }

  checkPlanes(status, idPlan) {
    for (let i of this.arregloprincipal) {
      if (i.idPlan[0] == idPlan) {
        i.selected = status;
        this.preSelectedArray.push(i);
      }
    }

    this.todosplan = false;

  }

  filtrar() {
    let dataresult;
    if( this.todascat === true && this.todosplan === true){
       dataresult = this.preSelectedArray=[];
    }else{
     dataresult = this.preSelectedArray;
      
    }
    dataresult.type=this.tipo;
    this.valueChange.emit(dataresult);
      this.activeModal.close('Modal Closed');
  }
}
