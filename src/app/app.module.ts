import { AdminDashboardComponent } from './administratorPage/admin-dashboard/admin-dashboard.component';
import { RoleGuardService } from './providers/role-guard.service';
import { ManageUsersComponent, UserModifyDialog, UserDeleteDialog } from './administratorPage/manage-users/manage-users.component';
import { SafeUrlPipe } from './pipes/safeUrl.pipe';
import { MatchFilterPipe } from './pipes/match-filter.pipe';
import { MobileViewService } from './providers/mobileView.service';
import { NewsListComponent } from './home-page/news-list/news-list.component';
import { BettingPercentagePipe } from './pipes/betting-percentage.pipe';
import { BettingHoursPipe } from './pipes/betting-hours.pipe';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {RouterModule, Routes} from "@angular/router";
import {ShareButtonsModule} from 'ngx-sharebuttons';

import {LabelsPageComponent, LabelDeleteDialog, LabelModifyDialog, LabelNewDialog} from './labels-page/labels-page.component';

import {LocationStrategy, HashLocationStrategy} from "@angular/common";

import { AppComponent } from './app.component';

import { AngularFireModule } from 'angularfire2';
import {AF} from "./providers/af";
import { LoginPageComponent } from './login-page/login-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ChatPageComponent } from './chat-page/chat-page.component';
import { AddNewComponent } from './add-new/add-new.component';
import { DeleteNewsComponent, DeleteDialog } from './delete-news/delete-news.component';
import { EditorDirective } from './editor.directive';
import { InfiniteScrollModule } from 'angular2-infinite-scroll';
import {SelectModule} from 'ng-select';

//import { CKEditorModule } from 'ng2-ckeditor';
import { NewsModalComponent } from './news-modal/news-modal.component';
import {ModalModule} from "ngx-modal";
import { SafePipe } from './safe.pipe';
import { FilterPipeModule } from 'ngx-filter-pipe';
import {NgxPaginationModule} from 'ngx-pagination';

//import { TinymceModule } from 'angular2-tinymce'; //issue: https://github.com/Ledzz/angular2-tinymce/issues/11
import { FroalaEditorModule, FroalaViewModule} from 'angular-froala-wysiwyg';
import { SettingsComponent } from './settings/settings.component';
import { ProfileModalComponent } from './profile-modal/profile-modal.component';
import { RegistrationPageComponent } from './registration-page/registration-page.component';
import { LabelFilterPipe } from './label-filter.pipe';
import { PaginationPipePipe } from './pagination-pipe.pipe';

import { TagInputModule } from 'ng2-tag-input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // this is needed!

import {FlexLayoutModule} from "@angular/flex-layout";
import {NgxChartsModule} from '@swimlane/ngx-charts';  

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
import { MyMasonryDirective } from './myMasonry.directive';
import { MatchesPageComponent } from './matches-page/matches-page.component';
import { AdministratorPageComponent } from './administratorPage/administratorPage.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ChartModule } from 'angular2-chartjs';

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
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'gamenews/All'
    },
    { path: 'news/:key', component: NewsModalComponent },
    { path: 'gamenews/:game', component: NewsListComponent }
      ] },
  { path: 'administrator', component: AdministratorPageComponent,
  canActivate: [RoleGuardService],
  data: { roles: ['author', 'admin'] },
  children: [
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'dashBoard'
    },
      { path: 'dashBoard', component: AdminDashboardComponent},
        { path: 'addNews', component: AddNewComponent},
        { path: 'deleteNews', component: DeleteNewsComponent},
        { path: 'labelsPage', component: LabelsPageComponent},
        { path: 'manageUsers', component: ManageUsersComponent, 
          canActivate: [RoleGuardService], data: { roles: ['admin'] }}
      ]  },
  { path: 'matches', component: MatchesPageComponent}
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
    LabelDeleteDialog,
    LabelModifyDialog,
    LabelNewDialog,
    DeleteNewsComponent,
    BetModalComponent,
    BettingHoursPipe,
    BettingPercentagePipe,
    NewsListComponent,
    MyMasonryDirective,
    MatchesPageComponent,
    MatchFilterPipe,
    SafeUrlPipe,
    AdministratorPageComponent,
    DeleteDialog,
    EditProfileComponent,
    ManageUsersComponent,
    UserModifyDialog,
    UserDeleteDialog,
    AdminDashboardComponent
],
  entryComponents:[
    LoginPageComponent,
    BetModalComponent,
     DeleteDialog,
     LabelDeleteDialog,
     LabelModifyDialog,
     LabelNewDialog,
     EditProfileComponent,
     UserModifyDialog,
     UserDeleteDialog
    ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    //CKEditorModule,
    ModalModule,
    AngularFireModule.initializeApp(firebaseConfig),
    RouterModule.forRoot(routes),
    InfiniteScrollModule,
    SelectModule,
    FilterPipeModule,
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
    ReactiveFormsModule,
    NgxChartsModule,
    ChartModule,
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot()
  ],
  providers: [/*{provide: ErrorHandler, useClass: MyErrorHandler},*/AF, RoleGuardService, MobileViewService, { provide: LocationStrategy, useClass: HashLocationStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }
