import { Component, OnInit } from '@angular/core';
import { AF } from "../providers/af";
import { FirebaseListObservable } from "angularfire2";
import {NgxPaginationModule, PaginationInstance} from 'ngx-pagination';

@Component({
  selector: 'app-delete-news',
  templateUrl: './delete-news.component.html',
  styleUrls: ['./delete-news.component.css']
})
export class DeleteNewsComponent implements OnInit {

  currentNews : FirebaseListObservable<any>;
  existingLabels : FirebaseListObservable<any>;

  newsFilter: any = { title: '',labels:{} };

  searchText:string;

  selectedNews:any = {title:"",creator:{displayname:""},timestamp:""};

  public config: PaginationInstance = {
        id: 'config',
        itemsPerPage: 10,
        currentPage: 1
    };

  constructor(public afService: AF) {
    this.currentNews = this.afService.news;
    this.existingLabels = this.afService.labels;
  }

  ngOnInit() {
  }

  search(){
    this.newsFilter.title = this.searchText;
  }

  setSelected(news: any){
    this.selectedNews = news;
  }

  deleteSelected(){
    this.currentNews.remove(this.selectedNews.$key).then(_ => console.log(this.selectedNews.$key+' deleted!'));;
  }

  clearSelected(){
    this.selectedNews = {title:"",creator:{displayname:""},timestamp:""};
  }
  setSelectedLabel(label:string, def: boolean = false){
    if(def){
      this.newsFilter.labels = {};
    }
    else{
      this.newsFilter.labels = {};
      this.newsFilter.labels[label] = true;
    }
  }

}
