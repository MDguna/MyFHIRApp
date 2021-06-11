import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController,  Events } from '@ionic/angular';
// import { Plugins } from '@capacitor/core';
import { InAppBrowser, InAppBrowserObject } from '@ionic-native/in-app-browser/ngx';
import { HttpClient, HttpParams, HttpHeaders, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { switchMap, mergeMap, debounceTime, map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Patient2Provider, AuthData, OpenIDTokenData, UserProfile } from '../../services/athena/patient2';
import { JwtHelper } from 'angular2-jwt';


@Component({
  selector: 'app-browser2',
  templateUrl: './browser2.page.html',
  styleUrls: ['./browser2.page.scss']
})
export class Browser2Page {


  private browserRef: InAppBrowserObject;
  public authData: AuthData;
  public hasLoggedIn: boolean = false;
  public searchResults: any;
  public error: any;
  jwtHelper = new JwtHelper();
  username: string;
  userId: string;
  password: string;
  user: UserProfile;
  private tokenUrl = 'https://api.athenahealth.com/oauthpreview/token';
  private REF_TOKEN_KEY = 'refresh_token';

  constructor(
    public navCtrl: NavController,
    // public navParams: NavParams,
    public inAppBrowser: InAppBrowser,
    private events: Events,
    private http: HttpClient,
    private patient1: Patient2Provider,
    private ref: ChangeDetectorRef,
   // private touchId: TouchID
  ) {
    // listen for redirect events...
    this.events.subscribe('deeplink:detected', (data, time) => {
   
     this.getToken('grant_type=client_credentials&username='  +  this.userId + '&password=' +  this.password + '');
      if (data.url.indexOf('/search') >= 0) {
        console.info('**** searching from deeplink: ')
        console.warn(data.url.split('?query=')[1].split('#')[0])
        setTimeout(() => {
          this.search({
            target: {
              value: data.url.split('?query=')[1].split('#')[0]
            }
          });
        }, 1000);
      }
    });

    
  }

  ngOnInit() {
    console.log('ionViewDidLoad BrowserPage');
  
    // this.getToken('grant_type=client_credentials&username='  +  this.userId + '&password=' +  this.password + '');
  }

  browserOpen() {
   console.info('*** authorization url: ');
   
    this.getToken('grant_type=client_credentials&username='  +  this.userId + '&password=' +  this.password + '');
  }

  search(query: any) {
    console.warn('*** searching for: ', query)
    this.patient1
      .search(query.target.value)
      .toPromise()
      .then((searchResults: any) => {
        this.searchResults = searchResults.entry;
        console.info(this.searchResults.length);
        this.ref.detectChanges();
      })
      .catch(error => {
        console.error(JSON.stringify(error));
        this.error = error;
        this.ref.detectChanges();
      });
  }

 

  private getToken(payload) {
    let reqOpts = {
      headers: {
        grant_type: 'client_credentials',
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'authorization': 'Basic '  +  this.userId + ':' +  this.password + '' ,
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
          let prompt = confirm(`Error: ${err.error} ocurred would you like to see more info?`);
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
         
          this.hasLoggedIn = true;
          this.authData = <any>response;
        
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
    //alert("id token is " + this.authData.id_token);

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
