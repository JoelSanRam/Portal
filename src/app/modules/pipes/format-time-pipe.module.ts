import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatTimePipe } from '@app/shared/filter-pipe';



@NgModule({
    declarations: [FormatTimePipe],
    imports: [CommonModule],
    exports: [FormatTimePipe],
})
export class FormatTimePipeModule {}
