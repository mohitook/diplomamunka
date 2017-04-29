import { Component, OnInit } from '@angular/core';
import { FirebaseListObservable } from "angularfire2";
import { AF } from "../providers/af";

@Component({
  selector: 'app-labels-page',
  templateUrl: './labels-page.component.html',
  styleUrls: ['./labels-page.component.css']
})
export class LabelsPageComponent implements OnInit {

  existingLabels : FirebaseListObservable<any>;

  labelFilter: any = { value: '' };

  searchText:string;

  selectedLabel:any = {image:'', value:'',label:''};

  newImageUrl:string;

  constructor(public afService: AF) {
    this.existingLabels = this.afService.labels;
   }

  ngOnInit() {
  }

  search(){
    this.labelFilter = {value:this.searchText};
  }

  setSelected(label: any){
    this.selectedLabel = label;
  }

  clearSelected(){
    this.selectedLabel = {image:'', value:'',label:''};
  }

  saveModifications(){
    this.selectedLabel.image = this.newImageUrl;
    this.afService.af.database.object('labels/'+this.selectedLabel.$key).set(
      this.selectedLabel
    );
  }

  deleteSelected(){
    this.existingLabels.remove(this.selectedLabel.$key).then(_ => console.log(this.selectedLabel.$key+' deleted!'));;
  }

}
