import { isArray } from 'util';
import { Pipe, PipeTransform } from '@angular/core';
import { find } from 'lodash';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'searchFilter' })
export class SearchFilterPipe implements PipeTransform {
    transform(value: any, search: string): any {
        if (!search) {
            return value;
        }
        let solution = value.filter((v) => {
            if (!v) {
                return;
            }
            return v;
        });
        return solution;
    }
}

@Pipe({
    name: 'currencyFormat',
})
export class CurrencyformatPipe implements PipeTransform {
    transform(value: any): any {
        let currency: string = value;
        if (value === 0) {
            currency = '$0.00'
        } else if (value) {
            const decimal = value.toFixed(2);
            currency = '$' + decimal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        return currency;
    }
}

@Pipe({
    name: 'currencyFormatSymbol',
})
export class CurrencyformatSymbolPipe implements PipeTransform {
    transform(value: any): any {
        let currency: string = value;
        let symbol;
        if (value === 0) {
            currency = '$0.00'
        } else if (value) {
            if(value < 0) {
                value = Math.abs(value);
                symbol = '';
            }else{
                symbol = '';
            }
            const decimal =  value.toFixed(2);
            currency = symbol+' $' + decimal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        return currency;
    }
}

@Pipe({
    name: 'labelOcp',
})
export class labelCapacidadPipe implements PipeTransform {
    transform(value: any): any {
        let ocup: number = value;
        var label;
        switch (ocup) {
            case 1:
                label = 'SGL';
                break;
            case 2:
                label = 'DBL';
                break;
            case 3:
                label = 'TRP';
                break;
            case 4:
                label = 'CPL';
                break;
            case 5:
                label = 'QPL';
                break;
        }
        return label;
    }
}

@Pipe({
    name: 'calculateTCD',
})
export class CalculateTCDPipe implements PipeTransform {
    transform(rate: any, currencyOp: any, currencies: any): any {
        let totalCurrency = 0;
        
        if (currencies instanceof Array) {
            const currency = find(currencies, (c) => {
                return c.currency_name === currencyOp;
            });
            const exchangeRate = currency.tasa_cambio;
            return (totalCurrency = Math.ceil(rate * exchangeRate));
        } else {
            return (totalCurrency = Math.ceil(rate * currencies));
        }
    }
}

@Pipe({
    name: 'replace',
})
export class ReplacePipe implements PipeTransform {
    transform(value: any, strToReplace: any, replacementStr): any {
        if (value) {
            value = value.replace(new RegExp(strToReplace, 'g'), replacementStr);
        }

        return value;
    }
}

@Pipe({
    name: 'categoria',
})
export class CategoriaPipe implements PipeTransform {
    transform(value: any, array: Array<any>): any {
        if (value) {
            const categoria = find(array, { categoria_codigo: value });
            if (typeof categoria?.name != 'undefined') {
                return categoria?.name;
            }
        }

        return value;
    }
}

@Pipe({
    name: 'lpad'
})
export class lpad implements PipeTransform {
    transform(value: any, args?: any): any {
        let s = value + "";
        while (s.length < args) s = "0" + s;
        return s;
    }
}

@Pipe({
    name: 'truncateHtml'
})
export class truncateHtml implements PipeTransform {
    transform(text: string, ){
        if (!text) {
            return text;
        }
        let without_html = text.replace(/<(?:.|\n)*?>/gm, ' ');
        return without_html;
    }
}

@Pipe({
    name: 'formatTime',
})
export class FormatTimePipe implements PipeTransform {
    transform(value: number): string {
        const minutes: number = Math.floor(value / 60);
        return (
            ('00' + minutes).slice(-2) +
            ':' +
            ('00' + Math.floor(value - minutes * 60)).slice(-2)
        );
    }
}
@Pipe({ name: 'range' })
export class RangePipe implements PipeTransform {
    transform(value): any {
        let result = [];
        for (let i = 0; i < value; i++) {
            result.push(i);
        }
        return result;
    }
}

@Pipe({ name: 'safeUrl' })
export class SafeUrlPipe implements PipeTransform {
    constructor(private _sanitizer: DomSanitizer) { }
    transform(url: any) {
        return this._sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}
@Pipe({ name: 'safeHtml' })
export class safeHtmlPipe implements PipeTransform {
    constructor(private _sanitizer: DomSanitizer) { }
    transform(value: string): SafeHtml {
        return this._sanitizer.bypassSecurityTrustHtml(value);
    }
}

@Pipe({ name: 'ifExistLink' })
export class ifExistLink implements PipeTransform {
    transform(link: string) {
        if(link==''){
            return {'cursor' : 'unset', 'pointer-events' : 'none'};
        }else{
            return {'cursor' : 'pointer'};
        }
    }
}