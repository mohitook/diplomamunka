import { MyMasonryDirective } from './../../myMasonry.directive';
import { BetModalComponent } from '../../bet-modal/bet-modal.component';
import { Component, HostListener, OnInit, AfterViewChecked, AfterViewInit ,ElementRef, ViewChild,Pipe,PipeTransform,Sanitizer, Inject } from '@angular/core';
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

import 'imagesLoaded';

declare var $ :any; //for custom buttons in text editor

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.css']
})
export class NewsListComponent implements OnInit, AfterViewChecked {

  specificNews: FirebaseListObservable<any>;
  loadedIn = false;
  game;
  
  public config: PaginationInstance = {
    id: 'config',
    itemsPerPage: 10,
    currentPage: 1
};
p;

  @ViewChild(MyMasonryDirective) directive = null;

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

 //to make sure the elements won't callopse if you change view on mobile!
 @HostListener('window:resize', ['$event'])
 onResize(event){
    //console.log("Width: " + event.target.innerWidth);
    this.directive.sortElements();
 }

  ngOnInit() {
  }

  //being called in every sec, doesn't affect that much on cpu and memory..
  //it is needed in case if a new content arrives and the client page is already loaded(calculate again)
  //also it is needed to calculate paginator page item positions
  ngAfterViewChecked(): void {
    //this.directive.sortElements();

    //commented out because it doesn't work as expected
  }

  onImgLoad(image: any){
    //$(image).parent().parent()[0].hidden = false; //this can cose unexpected behaviour!
    this.directive.sortElements();
  }
}
