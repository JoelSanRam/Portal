import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ratingHotel'
})
export class RatingHotelPipe implements PipeTransform {

  transform(value: any): any {
    var html;
    switch (value) {
      case 'S1':
        html = '<ul class=" d-inline list-inline"><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li></ul>';
        break;
      case 'S15':
        html = '<ul class=" d-inline list-inline"><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fas fa-star-half-alt text-warning"></i></li></ul>';
        break;
      case 'S2':
        html = '<ul class=" d-inline list-inline"><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li></ul>';
        break;
      case 'S25':
        html = '<ul class=" d-inline list-inline"><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fas fa-star-half-alt text-warning"></i></li></ul>';
        break;
      case 'S3':
        html = '<ul class=" d-inline list-inline"><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li></ul>';
        break;
      case 'S35':
        html = '<ul class=" d-inline list-inline"><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fas fa-star-half-alt text-warning"></i></li></ul>';
        break;
      case 'S4':
        html = '<ul class=" d-inline list-inline"><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li></ul>';
        break;
      case 'S45':
        html = '<ul class=" d-inline list-inline"><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fas fa-star-half-alt text-warning"></i></li></ul>';
        break;
      case 'S5':
        html = '<ul class=" d-inline list-inline"><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li></ul>';
        break;
      case 'S55':
        html = '<ul class=" d-inline list-inline"><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fas fa-star-half-alt text-warning"></i></li></ul>';
        break;
      case 'S6':
        html = '<ul class=" d-inline list-inline"><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li><li class="list-inline-item"><i class="fa fa-star text-warning"></i></li></ul>';
        break;
    }
    return html;
  }

}
