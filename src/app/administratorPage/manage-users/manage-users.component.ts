import { PaginationInstance } from 'ngx-pagination';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { AF } from './../../providers/af';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {

  searchText: string;
  searchOption: string = 'displayName';
  userFilter: any = { displayName: ''};

  public config: PaginationInstance = {
    id: 'config',
    itemsPerPage: 10,
    currentPage: 1
};

  constructor(public afService: AF,  public dialog: MdDialog) { }

  ngOnInit() {
  }

  search(){
    this.userFilter = {[this.searchOption]: this.searchText};
  }

  keyDownFunction(event) {
    if(event.keyCode == 13) {
      this.search();
    }
  }

  openModifyDialog(user: any): void {
    let dialogRef = this.dialog.open(UserModifyDialog, {
      width: '400px',
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log('The dialog was closed');

    });
  }

  openDeleteDialog(user: any): void {
    let dialogRef = this.dialog.open(UserDeleteDialog, {
      width: '400px',
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log('The dialog was closed');

    });
  }

}

//modal delete label
@Component({
  selector: 'delete-dialog',
  templateUrl: 'delete-dialog.html',
  styleUrls: ['./manage-users.component.css']
})
export class UserDeleteDialog {

  user: any;

  constructor(public afService: AF,
    public dialogRef: MdDialogRef<UserDeleteDialog>,
    @Inject(MD_DIALOG_DATA) public data: any) { 
      this.user = data;
    }

  onNoClick(): void {
    this.dialogRef.close();
  }
  
  deleteSelected(){
    this.afService.users.remove(this.user.$key).then(_ => console.log(this.user.$key+' deleted!'));
  }

}

//modal modify label picture
@Component({
  selector: 'modify-dialog',
  templateUrl: 'modify-dialog.html',
  styleUrls: ['./manage-users.component.css']
})
export class UserModifyDialog {

  user: any;

  adminColor = 'warn';
  authorColor = 'primary';

  admin: boolean;
  author: boolean;

  constructor(public afService: AF,
    public dialogRef: MdDialogRef<UserModifyDialog>,
    @Inject(MD_DIALOG_DATA) public data: any) { 
      this.user = data;
      this.admin = (data.roles && data.roles.admin && (data.roles.admin === true)) ? true : false;
      this.author = (data.roles && data.roles.author && (data.roles.author === true)) ? true : false;
    }

  onNoClick(): void {
    this.dialogRef.close();
  }
  
  saveModifications(){
    //console.log(this.admin + '|' + this.author);
   this.afService.af.database.object('users/' + this.user.$key + '/roles/admin').set(
    this.admin
   );
   this.afService.af.database.object('users/' + this.user.$key + '/roles/author').set(
    this.author
   );
  }
}
