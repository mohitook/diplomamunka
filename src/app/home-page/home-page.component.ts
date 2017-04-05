import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild,Pipe,PipeTransform,Sanitizer } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { AF } from "../providers/af";
import { FirebaseListObservable, FirebaseObjectObservable } from "angularfire2";
import {Observable} from 'rxjs/Observable';
import "rxjs/add/operator/map";

import { Router } from "@angular/router";


@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

    news: FirebaseListObservable<any>;

    news2: Observable<any>;

    selectedNews;

    constructor(public afService: AF,private sanitizer:DomSanitizer){
      this.news = this.afService.news.map(items => items.sort((a, b) => b.timestamp - a.timestamp)) as FirebaseListObservable<any[]>;
      //this.selectedNews = this.news.subscribe(x=>{this.selectedNews = x[0]; console.log(this.selectedNews);});

      this.news.subscribe(x=>console.log(x));

      this.news.forEach((x)=>{
        console.log(x.$key);
      });

    }

    ngOnInit() { }

}
