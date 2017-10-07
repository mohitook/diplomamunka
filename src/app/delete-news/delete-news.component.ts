import { Component, OnInit, Inject } from '@angular/core';
import { AF } from "../providers/af";
import { FirebaseListObservable } from "angularfire2";
import {NgxPaginationModule, PaginationInstance} from 'ngx-pagination';
import {MdDialog, MdDialogRef, MD_DIALOG_DATA} from '@angular/material';

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

  constructor(public afService: AF, public dialog: MdDialog) {
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

  keyDownFunction(event) {
    if(event.keyCode == 13) {
      this.search();
    }
  }
  
  openDeleteDialog(news: any): void {
    let dialogRef = this.dialog.open(DeleteDialog, {
      width: '400px',
      data: {news: news}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');

    });
  }


}

//modal
@Component({
  selector: 'delete-dialog',
  templateUrl: 'delete-dialog.html',
})
export class DeleteDialog {

  selectedNews: any;

  constructor(public afService: AF,
    public dialogRef: MdDialogRef<DeleteDialog>,
    @Inject(MD_DIALOG_DATA) public data: any) { 
      this.selectedNews = data.news;
    }

  onNoClick(): void {
    this.dialogRef.close();
  }
  
  deleteSelected(){
    this.afService.news.remove(this.selectedNews.$key).then(_ => console.log(this.selectedNews.$key+' deleted!'));;
  }

}
