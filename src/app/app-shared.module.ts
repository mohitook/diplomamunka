import { SafePipe } from './safe.pipe';
import { PaginationPipePipe } from './pagination-pipe.pipe';
import { LabelFilterPipe } from './label-filter.pipe';
import { SafeUrlPipe } from './pipes/safeUrl.pipe';
import { BettingPercentagePipe } from './pipes/betting-percentage.pipe';
import { BettingHoursPipe } from './pipes/betting-hours.pipe';
import { MatchFilterPipe } from './pipes/match-filter.pipe';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { ChartModule } from 'angular2-chartjs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ShareButtonsModule } from 'ngx-sharebuttons';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TagInputModule } from 'ng2-tag-input';
import { NgxPaginationModule } from 'ngx-pagination';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { SelectModule } from 'ng-select';
import { InfiniteScrollModule } from 'angular2-infinite-scroll';
import { RouterModule } from '@angular/router';
import { AngularFireModule } from 'angularfire2';
import { ModalModule } from 'ngx-modal';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { MdAutocompleteModule, MdButtonModule,
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
    MdTooltipModule, } from "@angular/material";

// Must export the config
export const firebaseConfig = {
    apiKey: "AIzaSyA5F2tA1GRgsyJNReTuxuyQC20WrpDRSy4",
      authDomain: "dipterv-f7bce.firebaseapp.com",
      databaseURL: "https://dipterv-f7bce.firebaseio.com",
      storageBucket: "dipterv-f7bce.appspot.com",
      messagingSenderId: "920667940828"
  };


@NgModule({
  imports: [
    FormsModule,
    ModalModule,
    AngularFireModule.initializeApp(firebaseConfig),
    InfiniteScrollModule,
    SelectModule,
    FilterPipeModule,
    NgxPaginationModule,
    TagInputModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    NgxChartsModule,
    ChartModule,
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(),
    

    //Angular material modules
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
  ],
  exports:[

    FormsModule,
    ModalModule,
    AngularFireModule,
    InfiniteScrollModule,
    SelectModule,
    FilterPipeModule,
    NgxPaginationModule,
    TagInputModule, 
    FlexLayoutModule,
    ReactiveFormsModule,
    NgxChartsModule,
    ChartModule,
    FroalaEditorModule, FroalaViewModule,
    
    //pipes
    MatchFilterPipe,
    BettingHoursPipe,
    BettingPercentagePipe,
    SafeUrlPipe,
    LabelFilterPipe,
    PaginationPipePipe,
    SafePipe,


    //Angular material modules

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
  ],
  declarations: [
    MatchFilterPipe,
    BettingHoursPipe,
    BettingPercentagePipe,
    SafeUrlPipe,
    LabelFilterPipe,
    PaginationPipePipe,
    SafePipe,
]
})
export class SharedModule { }