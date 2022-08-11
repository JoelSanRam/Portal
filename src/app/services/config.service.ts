import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IConfig } from '@app/models';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  static configFile: IConfig;
  constructor(private http: HttpClient) {}
  load() {
    const jsonFile = './config.json';
    return new Promise<void>((resolve, reject) => {
      this.http
        .get(jsonFile)
        .toPromise()
        .then((response: IConfig) => {
          ConfigService.configFile =  response as IConfig;
          resolve();
        })
        .catch((response: any) => {
          reject(
            `Could not load file '${jsonFile}': ${JSON.stringify(response)}`
          );
        });
    });
  }
}
