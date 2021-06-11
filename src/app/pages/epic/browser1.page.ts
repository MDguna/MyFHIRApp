import { Component, ChangeDetectorRef } from '@angular/core';
import {  NavController,  Events } from '@ionic/angular';
// import { Plugins } from '@capacitor/core';
import { InAppBrowser, InAppBrowserObject } from '@ionic-native/in-app-browser/ngx';
import { HttpClient, HttpParams, HttpHeaders, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { switchMap, mergeMap, debounceTime, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Patient1Provider, AuthData, OpenIDTokenData, UserProfile } from '../../services/epic/patient1';
import { JwtHelper } from 'angular2-jwt';


@Component({
  selector: 'page-browser1',
  templateUrl: './browser1.page.html',
  styleUrls: ['./browser1.page.scss']
})
export class Browser1Page {
 
  

  private browserRef: InAppBrowserObject;
  public authData: AuthData;
  public hasLoggedIn: boolean = false;
  public searchResults: any;
  public error: any;
  jwtHelper = new JwtHelper();
  username: string;
  user: UserProfile;
  clientId: string = '7a09c465-c963-46bc-8181-6308b4c42a98';
  //7a09c465-c963-46bc-8181-6308b4c42a98
  redirectURL : string = 'http%3A%2F%2Flocalhost%3A8100%2Fepic';
  FHIR : string = 'https://open-ic.epic.com';
  private tokenUrl =  this.FHIR + '/argonaut/oauth2/token';
  private REF_TOKEN_KEY = 'refresh_token';
  private url = this.FHIR.trim() + '/argonaut/oauth2/authorize?response_type=code&client_id=' +  this.clientId.trim() + '&redirect_uri=' +  this.redirectURL.trim()  ;
  
 

  constructor(
    public navCtrl: NavController,
    // public navParams: NavParams,
    public inAppBrowser: InAppBrowser,
    private events: Events,
    private http: HttpClient,
    private patient1: Patient1Provider,
    private ref: ChangeDetectorRef,
   // private touchId: TouchID
  ) {
    // listen for redirect events...
    this.events.subscribe('deeplink:detected', (data, time) => {
      console.info('*** Deeplink data: ', data);
      this.browserRef.close();
     //alert("data url is " + data.URL);
    
     
      if (data.url.indexOf('/search') >= 0) {
        console.info('**** searching from deeplink: ')
        console.warn(data.url.split('?query=')[1])
        setTimeout(() => {
          this.search({
            target: {
              value: data.url.split('?query=')[1]
            }
          });
        }, 1000);
      }
    });

    
  }

  ngOnInit() {
    console.log('ionViewDidLoad BrowserPage');
    //alert("document url is " + document.URL);
    if (document.URL.indexOf("?") > 0) {
      let splitURL = document.URL.split("?")[1];
      // alert("split url is " + splitURL);
	    let splitParams = splitURL.split("&");
       let payload = 'grant_type=authorization_code&' + splitURL + '&redirect_uri=' +  this.redirectURL  + '&client_id=' +  this.clientId ;
      //  alert("payload is " + payload);
        this.getToken(payload);
      
    }
   // alert("data url is " + this.url);
  }

  browserOpen() {
    console.info('*** authorization url: ', this.url);
    this.browserRef = this.inAppBrowser.create(this.url, "_parent");
  
  }

  search(query: any) {
    console.warn('*** searching for: ', query);
   // alert(query.target.value);
    this.patient1
      .search(query.target.value, this.FHIR)
      .toPromise()
      .then((results: any) => {
        this.searchResults = results.entry;
        console.info(this.searchResults.length);
        this.ref.detectChanges();
      })
      .catch(error => {
        console.error(error);
        this.error = error;
        this.ref.detectChanges();
      });
  }



  private getToken(payload) {
    let reqOpts = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
   
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
         // alert(response);
          console.log('*** publishing response:', response);
          this.events.publish('user:loggedin', response);
         
          if (this.authData.refresh_token) {
              // alert("refresh token is " + this.authData.refresh_token);
            console.log('*** saving refresh token to LS');
            window.localStorage.setItem(this.REF_TOKEN_KEY, this.authData.refresh_token);
          }
          this.ref.detectChanges();
        }
      });
  }

  getProfile() {
    // alert("id token is " + this.authData.id_token);

    let decodedData: OpenIDTokenData = this.jwtHelper.decodeToken(this.authData.id_token);
    if (decodedData) {
    
      let reqOpts = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: this.authData.token_type + ' ' + this.authData.access_token
        }
      };
      
    }
  }
}
