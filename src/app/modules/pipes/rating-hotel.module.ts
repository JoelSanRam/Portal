import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingHotelPipe } from '@app/pipe/rating-hotel.pipe';

@NgModule({
  declarations: [
    RatingHotelPipe,
  ],
  imports: [
    CommonModule
  ],
  exports: [RatingHotelPipe]
})
export class RatingHotelModule { }
