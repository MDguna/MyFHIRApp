import { Component, ChangeDetectorRef } from '@angular/core';
import {  NavController,  Events } from '@ionic/angular';
// import { Plugins } from '@capacitor/core';
import { InAppBrowser, InAppBrowserObject } from '@ionic-native/in-app-browser/ngx';
import { HttpClient, HttpParams, HttpHeaders, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { switchMap, mergeMap, debounceTime, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ConsumerProvider, AuthData, OpenIDTokenData, UserProfile } from '../../services/bluebutton/consumer';
import { JwtHelper } from 'angular2-jwt';


@Component({
  selector: 'page-bluebutton',
  templateUrl: './bluebutton.page.html',
  styleUrls: ['./bluebutton.page.scss']
})
export class BluebuttonPage {
 
  

  private browserRef: InAppBrowserObject;
  public authData: AuthData;
  public hasLoggedIn: boolean = false;
  public searchResults: any;
  public error: any;
  jwtHelper = new JwtHelper();
  username: string;
  user: UserProfile;
  eob: any;
  coverage: any;
  demographics : any;
  clientId: string = 'Si8p3NHh2cifOL6ORRdMgecJHAjTLXve943VGDRv';
  //7a09c465-c963-46bc-8181-6308b4c42a98
  redirectURL : string = 'http://localhost:8100/bluebutton';
  FHIR : string = 'https://sandbox.bluebutton.cms.gov';
  private tokenUrl =  this.FHIR + '/v1/o/token/';
  private REF_TOKEN_KEY = 'refresh_token';
  private url = this.FHIR.trim() + '/v1/o/authorize/?client_id=' +  this.clientId.trim() + '&redirect_uri=' +  this.redirectURL.trim() + '&response_type=code&state=8e896a59f0744a8e93bf2f1f13230be5' ;
  client_secret : string = "laCpuKPPp401jY18swWbABLGBwsNAm1u3m9HNimrlX6KDf5vRPpk6pcWh8Kf42SfnQe3gcKY0xOs4ojM1xo7JJtxsMpSy2Kxb8dTNnGfobbVv6WKuosxsYqtmqw5DE9H";
 FHIR_pateint_id : string;

  constructor(
    public navCtrl: NavController,
    // public navParams: NavParams,
    public inAppBrowser: InAppBrowser,
    private events: Events,
    private http: HttpClient,
    private patient1: ConsumerProvider,
    private ref: ChangeDetectorRef,
   // private touchId: TouchID
  ) {
    // listen for redirect events...
    this.events.subscribe('deeplink:detected', (data, time) => {
      console.info('*** Deeplink data: ', data);
      this.browserRef.close();
   // alert("data url is " + data.URL);
     if (data.url.indexOf('gov.cms.bluebutton.mdguna://bluebutton') >= 0) {
      let splitURL = data.URL.split("?")[1];
      // alert("split url is " + splitURL);
	    let splitParams = splitURL.split("&");
     // if (data.url.indexOf('http://localhost:8100/#/browser?code=') >= 0) {
        let payload = "client_id=" + this.clientId + "&client_secret=" + this.client_secret   + "&" + splitParams[0] + '&grant_type=authorization_code&redirect_uri=' +  this.redirectURL ;
        this.getToken(payload);
       // console.log(22222222222222);
      }
     
      if (data.url.indexOf('/coverage') >= 0) {
        console.info('**** searching from deeplink: ')
        console.warn(data.url.split('?query=')[1])
        setTimeout(() => {
          this.getCoverage();
        }, 1000);
      }
    });

    
  }

  ngOnInit() {
    console.log('ionViewDidLoad BrowserPage');
   // alert("document url is " + document.URL);
   if(this.authData)
   {
     
   }
    if (document.URL.indexOf("?") > 0) {
      let splitURL = document.URL.split("?")[1];
      // alert("split url is " + splitURL);
	    let splitParams = splitURL.split("&");
      let payload = "client_id=" + this.clientId + "&client_secret=" + this.client_secret   + "&" + splitParams[0] + '&grant_type=authorization_code&redirect_uri=' +  this.redirectURL ;
      //  alert("payload is " + payload);
        this.getToken(payload);
      
    }
   // alert("data url is " + this.url);
  }

  browserOpen() {
    console.info('*** authorization url: ', this.url);
    this.browserRef = this.inAppBrowser.create(this.url, "_parent");
  
  }

   private getToken(payload) {
    let reqOpts = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
   //alert(this.tokenUrl);
    // alert("token payload is " + payload);
    console.info('*** getting token url: ');
    console.log(this.tokenUrl, payload, reqOpts);

    this.http
      .post(this.tokenUrl, payload, reqOpts)
      .pipe(
        
        catchError(err => {
          console.error('*** ERROR IN HTTP REQUEST', err);
          console.log(err.error);
          let prompt = confirm(`Error: ${err.error.error.toUpperCase()} ocurred would you like to see more info?`);
          if (prompt) {
            this.browserRef.close();
             this.browserRef = this.inAppBrowser.create(err.error.error_uri);
          
          }

          return of(undefined);
        })
      )
      .subscribe((response: HttpResponse<any> | HttpErrorResponse) => {
        if (response) {
          console.info('**** GOT RESPONSE>>>');
          // alert(JSON.stringify(response));
          this.hasLoggedIn = true;
          this.authData = <any>response;
          //alert(response);
          console.log('*** publishing response:', response);
          this.events.publish('user:loggedin', response);
  
          if (this.authData.refresh_token) {
              // alert("refresh token is " + this.authData.refresh_token);
            console.log('*** saving refresh token to LS');
            window.localStorage.setItem(this.REF_TOKEN_KEY, this.authData.refresh_token);
          }
          this.ref.detectChanges();
        //  this.getProfile();
         this.getEOB();
         this.getCoverage();
         this.getDemographics();
         //console.log(this.eob);
        }
      });
  }

getProfile() {
    // alert("id token is " + this.authData.id_token);
 this.patient1.getUserInfo(this.FHIR).toPromise()
.then((results: any) => {
  this.user = results;
  this.username = results.preferred_username;
  
})
.catch(error => {
  console.error(error);
  this.error = error;
  this.ref.detectChanges();
});
    
  }


  getEOB() {
    // alert("id token is " + this.authData.id_token);
 this.patient1.getEOB(this.authData.patient, this.FHIR).toPromise()
.then((results: any) => {
  this.eob = results;
console.log("eob is" + JSON.stringify(this.eob));
this.ref.detectChanges();
})
.catch(error => {
  console.error(error);
  this.error = error;
  this.ref.detectChanges();
});
    
  }

  getCoverage() {
  //  console.warn('*** searching for: ', query);
   // alert(query.target.value);
    this.patient1
      .getCoverage(this.authData.patient, this.FHIR)
      .toPromise()
      .then((results: any) => {
        this.coverage = results;
        console.log("coverage is" + JSON.stringify(this.coverage));
        this.ref.detectChanges();
      })
      .catch(error => {
        console.error(error);
        this.error = error;
        this.ref.detectChanges();
      });
  }


  getDemographics() {
    // alert("id token is " + this.authData.id_token);
 this.patient1.getDemographics(this.authData.patient, this.FHIR).toPromise()
.then((results: any) => {
  this.demographics = results;
console.log("demographics is" + JSON.stringify(this.demographics));
  
})
.catch(error => {
  console.error(error);
  this.error = error;
  this.ref.detectChanges();
});
    
  }

}
