import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events } from '@ionic/angular';
// import { Observable } from 'rxjs/Observable';

export interface AuthData {
  refresh_token: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token?: string;
  patient: string;
}

export interface OpenIDTokenData {
  sub: string;
  profile: string;
  fhirUser: string;
}

export interface UserProfile {
  resourceType: string;
  id: string;
  active: boolean;
  name: {
    use: string;
    text: string;
    family: string[];
    given: string[];
  };
}
@Injectable()
export class ConsumerProvider {
  private authData: AuthData;
  constructor(private events: Events, private http: HttpClient) {
    console.log('Hello PatientProvider Provider');
    this.events.subscribe('user:loggedin', authData => {
      console.log('*** [PatientProvider] authData: ', authData);
      this.authData = authData;
    });
  }

  getEOB(query: string, FHIR: string) {
    let url = FHIR + '/v1/fhir/ExplanationOfBenefit/?patient=';
    url = url + query ;
    let opts = {
      headers: {
        Accept: 'application/json',
        Authorization: this.authData.token_type + ' ' + this.authData.access_token
      }
    };
    console.log(opts);
    return this.http.get(url, opts);
  }

  getCoverage(query: string, FHIR: string) {
    let url = FHIR + '/v1/fhir/Coverage/?beneficiary=';
    url = url + query ;
    let opts = {
      headers: {
        Accept: 'application/json',
        Authorization: this.authData.token_type + ' ' + this.authData.access_token
      }
    };
    console.log(opts);
    return this.http.get(url, opts);
  }

  getUserInfo(FHIR: string) {
    let url = FHIR + '/v1/connect/userinfo';
   // url = url + query ;
   //alert(this.authData.token_type + ' ' + this.authData.access_token);
    let opts = {
      headers: {
        Accept: 'application/json',
        Authorization: this.authData.token_type + ' ' + this.authData.access_token
      }
    };
    console.log(opts);
    return this.http.get(url, opts);
  }

  getDemographics(query: string, FHIR: string) {
    let url = FHIR + '/v1/fhir/Patient/';
    url = url + query ;
    let opts = {
      headers: {
        Accept: 'application/json',
        Authorization: this.authData.token_type + ' ' + this.authData.access_token
      }
    };
    console.log(opts);
    return this.http.get(url, opts);
  }
  


}
