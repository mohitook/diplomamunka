import { FormControl, Validators } from '@angular/forms';
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { BetModalComponent } from './../bet-modal/bet-modal.component';
import { AF } from './../providers/af';
import { Component, OnInit, Inject, AfterViewChecked, ChangeDetectorRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit, AfterViewInit {



  pwReset = false;

  NOT_EMPTY_REGEX = /^.*[^ ].*$/;
  HTTP_REGEX = /^^(http|https|ftp):\/\/.*$/;

  nameFormControl = new FormControl('', [
    Validators.required, 
    Validators.pattern(this.NOT_EMPTY_REGEX)]);

  imageUrlFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(this.NOT_EMPTY_REGEX),
    Validators.pattern(this.HTTP_REGEX)]);

  constructor(public afService: AF, private cdRef:ChangeDetectorRef,
    public dialogRef: MdDialogRef<EditProfileComponent>,
    @Inject(MD_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

  ngAfterViewChecked(): void {
    
  }

  //only for avoid unwanted 'ExpressionChangedAfterItHasBeenCheckedError` error
  ngAfterViewInit(): void { 
    this.cdRef.detectChanges();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  resetClicked(){
    this.pwReset = true;
  }

}
