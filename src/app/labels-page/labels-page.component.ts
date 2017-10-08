import { Component, OnInit, Inject } from '@angular/core';
import { FirebaseListObservable } from "angularfire2";
import { AF } from "../providers/af";
import {MdDialog, MdDialogRef, MD_DIALOG_DATA} from '@angular/material';

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

  

  constructor(public afService: AF, public dialog: MdDialog) {
    this.existingLabels = this.afService.labels;
   }

  ngOnInit() {
  }

  search(){
    this.labelFilter = {value:this.searchText};
  }

  keyDownFunction(event) {
    if(event.keyCode == 13) {
      this.search();
    }
  }

  setSelected(label: any){
    this.selectedLabel = label;
  }

  clearSelected(){
    this.selectedLabel = {image:'', value:'',label:''};
  }

  openModifyDialog(label: any): void {
    let dialogRef = this.dialog.open(LabelModifyDialog, {
      width: '400px',
      data: {label: label}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');

    });
  }

  openDeleteDialog(label: any): void {
    let dialogRef = this.dialog.open(LabelDeleteDialog, {
      width: '400px',
      data: {label: label}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');

    });
  }

  addNewCategoryDialogOpen(){
    let dialogRef = this.dialog.open(LabelNewDialog, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}

//modal delete label
@Component({
  selector: 'delete-dialog',
  templateUrl: 'delete-dialog.html',
  styleUrls: ['./labels-page.component.css']
})
export class LabelDeleteDialog {

  selectedLabel: any;

  constructor(public afService: AF,
    public dialogRef: MdDialogRef<LabelDeleteDialog>,
    @Inject(MD_DIALOG_DATA) public data: any) { 
      this.selectedLabel = data.label;
    }

  onNoClick(): void {
    this.dialogRef.close();
  }
  
  deleteSelected(){
    this.afService.labels.remove(this.selectedLabel.$key).then(_ => console.log(this.selectedLabel.$key+' deleted!'));;
  }

}

//modal modify label picture
@Component({
  selector: 'modify-dialog',
  templateUrl: 'modifyLabel-dialog.html',
  styleUrls: ['./labels-page.component.css']
})
export class LabelModifyDialog {

  selectedLabel: any;
  newImageUrl:string;

  constructor(public afService: AF,
    public dialogRef: MdDialogRef<LabelDeleteDialog>,
    @Inject(MD_DIALOG_DATA) public data: any) { 
      this.selectedLabel = data.label;
    }

  onNoClick(): void {
    this.dialogRef.close();
  }
  
  saveModifications(){
    this.selectedLabel.image = this.newImageUrl;
    this.afService.af.database.object('labels/'+this.selectedLabel.$key).set(
      this.selectedLabel
    );
  }
}

//modal modify label picture
@Component({
  selector: 'newLabel-dialog',
  templateUrl: 'newLabel-dialog.html',
  styleUrls: ['./labels-page.component.css']
})
export class LabelNewDialog {

  newLabel:any

  constructor(public afService: AF,
    public dialogRef: MdDialogRef<LabelDeleteDialog>) { 
      this.newLabel = {label:'', imageUrl:''};
    }

  onNoClick(): void {
    this.dialogRef.close();
  }
  
  addLabel(){
    console.log(this.newLabel)
    this.afService.addNewLabel(this.newLabel);
  }

}
