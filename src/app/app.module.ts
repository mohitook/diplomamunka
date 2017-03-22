import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {RouterModule, Routes} from "@angular/router";
import { AppComponent } from './app.component';

import { AngularFireModule } from 'angularfire2';
import {AF} from "./providers/af";
import { LoginPageComponent } from './login-page/login-page.component';
import { HomePageComponent } from './home-page/home-page.component';

// Must export the config
export const firebaseConfig = {
  apiKey: "AIzaSyA5F2tA1GRgsyJNReTuxuyQC20WrpDRSy4",
    authDomain: "dipterv-f7bce.firebaseapp.com",
    databaseURL: "https://dipterv-f7bce.firebaseio.com",
    storageBucket: "dipterv-f7bce.appspot.com",
    messagingSenderId: "920667940828"
};

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'login', component: LoginPageComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    HomePageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig),
    RouterModule.forRoot(routes)
  ],
  providers: [AF],
  bootstrap: [AppComponent]
})
export class AppModule { }
