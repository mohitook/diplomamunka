import { MyMasonryDirective } from './../../myMasonry.directive';
import { BetModalComponent } from '../../bet-modal/bet-modal.component';
import { Component, OnInit, AfterViewChecked, AfterViewInit ,ElementRef, ViewChild,Pipe,PipeTransform,Sanitizer, Inject } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { AF } from "../../providers/af";
import { FirebaseListObservable, FirebaseObjectObservable } from "angularfire2";
import {Observable} from 'rxjs/Observable';
import "rxjs/add/operator/map";
import 'rxjs/add/observable/interval';
import { Subject } from 'rxjs/Subject';

import {NgxPaginationModule, PaginationInstance} from 'ngx-pagination';

import { Router, ActivatedRoute } from "@angular/router";

import {MediaChange, ObservableMedia} from "@angular/flex-layout";

import {MdSidenav, MdDialog, MdDialogRef, MD_DIALOG_DATA} from '@angular/material';

declare var $ :any; //for custom buttons in text editor

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.css']
})
export class NewsListComponent implements OnInit, AfterViewInit, AfterViewChecked {

  specificNews: FirebaseListObservable<any>;
  loadedIn = false;
  game;

  @ViewChild(MyMasonryDirective) directive = null

  constructor(public afService: AF, public route: ActivatedRoute, public router: Router,
    private sanitizer: DomSanitizer, private media: ObservableMedia, public dialog: MdDialog) {

   this.route.params.subscribe(params => {
     this.game = params['game'] ? params['game'] : 'All' ;
     this.specificNews = this.afService.selectSpecificNews(this.game);
     this.specificNews.subscribe(x=>{
       this.loadedIn = true;
     });
     console.log('route navigated to new label category:' + this.game);
   });
 }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    
  }

  ngAfterViewChecked(): void {
    this.directive.sortElements();
     //console.log('ngAfterViewChecked end')
  }
}
