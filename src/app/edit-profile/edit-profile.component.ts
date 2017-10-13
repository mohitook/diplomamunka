import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { BetModalComponent } from './../bet-modal/bet-modal.component';
import { AF } from './../providers/af';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  pwReset = false;

  constructor(public afService: AF,
    public dialogRef: MdDialogRef<EditProfileComponent>,
    @Inject(MD_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  resetClicked(){
    this.pwReset = true;
  }

}
