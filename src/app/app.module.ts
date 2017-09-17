import { BettingPercentagePipe } from './pipes/betting-percentage.pipe';
import { BettingHoursPipe } from './pipes/betting-hours.pipe';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {RouterModule, Routes} from "@angular/router";
import {ShareButtonsModule} from 'ngx-sharebuttons';

import {LabelsPageComponent} from './labels-page/labels-page.component';

import {LocationStrategy, HashLocationStrategy} from "@angular/common";

import { AppComponent } from './app.component';

import { AngularFireModule } from 'angularfire2';
import {AF} from "./providers/af";
import { LoginPageComponent } from './login-page/login-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ChatPageComponent } from './chat-page/chat-page.component';
import { AddNewComponent } from './add-new/add-new.component';
import { DeleteNewsComponent } from './delete-news/delete-news.component';
import { EditorDirective } from './editor.directive';
import { InfiniteScrollModule } from 'angular2-infinite-scroll';
import {SelectModule} from 'ng-select';

import { CKEditorModule } from 'ng2-ckeditor';
import { NewsModalComponent } from './news-modal/news-modal.component';
import {ModalModule} from "ngx-modal";
import { SafePipe } from './safe.pipe';
import { Ng2FilterPipeModule } from 'ng2-filter-pipe';
import {NgxPaginationModule} from 'ngx-pagination';

//import { TinymceModule } from 'angular2-tinymce'; issue: https://github.com/Ledzz/angular2-tinymce/issues/11

import 'tinymce/tinymce.min';
import { SettingsComponent } from './settings/settings.component';
import { ProfileModalComponent } from './profile-modal/profile-modal.component';
import { RegistrationPageComponent } from './registration-page/registration-page.component';
import { LabelFilterPipe } from './label-filter.pipe';
import { PaginationPipePipe } from './pagination-pipe.pipe';

import { TagInputModule } from 'ng2-tag-input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // this is needed!

import {FlexLayoutModule} from "@angular/flex-layout";

import {
  MdAutocompleteModule,
  MdButtonModule,
  MdButtonToggleModule,
  MdCardModule,
  MdCheckboxModule,
  MdChipsModule,
  MdCoreModule,
  MdDatepickerModule,
  MdDialogModule,
  MdExpansionModule,
  MdGridListModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdMenuModule,
  MdNativeDateModule,
  MdPaginatorModule,
  MdProgressBarModule,
  MdProgressSpinnerModule,
  MdRadioModule,
  MdRippleModule,
  MdSelectModule,
  MdSidenavModule,
  MdSliderModule,
  MdSlideToggleModule,
  MdSnackBarModule,
  MdSortModule,
  MdTableModule,
  MdTabsModule,
  MdToolbarModule,
  MdTooltipModule,
} from '@angular/material';

import HLTV from 'hltv';
import { BetModalComponent } from './bet-modal/bet-modal.component';

declare var tinymce: any;

// Must export the config
export const firebaseConfig = {
  apiKey: "AIzaSyA5F2tA1GRgsyJNReTuxuyQC20WrpDRSy4",
    authDomain: "dipterv-f7bce.firebaseapp.com",
    databaseURL: "https://dipterv-f7bce.firebaseio.com",
    storageBucket: "dipterv-f7bce.appspot.com",
    messagingSenderId: "920667940828"
};

const routes: Routes = [
  { path: '', component: HomePageComponent,
  children: [
    { path: 'post/:key', component: NewsModalComponent }
      ] },
      
  { path: 'login', component: LoginPageComponent},
  { path: 'chat', component: ChatPageComponent },
  { path: 'addnew', component: AddNewComponent,
  children: [
        { path: 'preview/:preview', component: NewsModalComponent }
      ]  },
  { path: 'settings', component: SettingsComponent },
  { path: 'profile-modal', component: ProfileModalComponent },
  { path: 'register', component: RegistrationPageComponent},
  { path: 'labelsPage', component: LabelsPageComponent},
  { path: 'deleteNews', component: DeleteNewsComponent}
];

/*class MyErrorHandler implements ErrorHandler {
  handleError(error) {
    console.log("ERROR happened");
  }
}*/


@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    HomePageComponent,
    ChatPageComponent,
    AddNewComponent,
    EditorDirective,
    NewsModalComponent,
    SafePipe,
    SettingsComponent,
    ProfileModalComponent,
    RegistrationPageComponent,
    LabelFilterPipe,
    PaginationPipePipe,
    LabelsPageComponent,
    DeleteNewsComponent,
    BetModalComponent,
    BettingHoursPipe,
    BettingPercentagePipe
],
  entryComponents:[BetModalComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    CKEditorModule,
    ModalModule,
    AngularFireModule.initializeApp(firebaseConfig),
    RouterModule.forRoot(routes),
    InfiniteScrollModule,
    SelectModule,
    Ng2FilterPipeModule,
    NgxPaginationModule,
    TagInputModule, BrowserAnimationsModule,
    ShareButtonsModule.forRoot(),
    MdAutocompleteModule,
    MdButtonModule,
    MdButtonToggleModule,
    MdCardModule,
    MdCheckboxModule,
    MdChipsModule,
    MdCoreModule,
    MdDatepickerModule,
    MdDialogModule,
    MdExpansionModule,
    MdGridListModule,
    MdIconModule,
    MdInputModule,
    MdListModule,
    MdMenuModule,
    MdNativeDateModule,
    MdPaginatorModule,
    MdProgressBarModule,
    MdProgressSpinnerModule,
    MdRadioModule,
    MdRippleModule,
    MdSelectModule,
    MdSidenavModule,
    MdSliderModule,
    MdSlideToggleModule,
    MdSnackBarModule,
    MdSortModule,
    MdTableModule,
    MdTabsModule,
    MdToolbarModule,
    MdTooltipModule,
    FlexLayoutModule,
    ReactiveFormsModule
  ],
  providers: [/*{provide: ErrorHandler, useClass: MyErrorHandler},*/AF,{ provide: LocationStrategy, useClass: HashLocationStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }
