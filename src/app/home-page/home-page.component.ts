import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild,Pipe,PipeTransform,Sanitizer } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { AF } from "../providers/af";
import { FirebaseListObservable } from "angularfire2";




@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

    news: FirebaseListObservable<any>;

    selectedNews;

    constructor(public afService: AF,private sanitizer:DomSanitizer){
      this.news = this.afService.news;
      //this.selectedNews = this.news.subscribe(x=>{this.selectedNews = x[0]; console.log(this.selectedNews);});

      this.selectedNews = {content:{title:"",summary:"",coverImageUrl:"",text:"",labels:[]}}

    }

    ngOnInit() { }

    setSelectedNews(news){
      //Object.assign(this.selectedNews,news);
      this.selectedNews = JSON.parse(JSON.stringify(news)); //this is the only working DEEP COPY! wtf...
      //http://stackoverflow.com/questions/38446235/div-innerhtml-not-working-with-iframe-html-in-angular2-html-inject
      //in fact it is not secure right now!! TODO: read about this bypassSecurityTrustHtml
      this.selectedNews.content.text = this.sanitizer.bypassSecurityTrustHtml(this.selectedNews.content.text);
    }

}
