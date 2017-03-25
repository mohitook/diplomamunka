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
import { ChatPageComponent } from './chat-page/chat-page.component';
import { AddNewComponent } from './add-new/add-new.component';
import { EditorDirective } from './editor.directive';

import { CKEditorModule } from 'ng2-ckeditor';


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
  { path: 'login', component: LoginPageComponent },
  { path: 'chat', component: ChatPageComponent },
  { path: 'addnew', component: AddNewComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    HomePageComponent,
    ChatPageComponent,
    AddNewComponent,
    EditorDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    CKEditorModule,
    AngularFireModule.initializeApp(firebaseConfig),
    RouterModule.forRoot(routes)
  ],
  providers: [AF],
  bootstrap: [AppComponent]
})
export class AppModule { }
