import { FormControl, Validators } from '@angular/forms';
import { MdDialogRef } from '@angular/material';
// src/app/login-page/login-page.component.ts
import { Component } from '@angular/core';
import {AF} from "../providers/af";
import {Router} from "@angular/router";
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  constructor(public dialogRef: MdDialogRef<LoginPageComponent>, public afService: AF, private router: Router) {}

  public error: any;

  registerPage = false;

  resetPasswordPage = false;


  NOT_EMPTY_REGEX = /^.*[^ ].*$/;
  NO_SPEC_CHAR_REGEX = /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/;
  //https://www.w3resource.com/javascript/form/email-validation.php
  EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  //https://stackoverflow.com/questions/14850553/javascript-regex-for-password-containing-at-least-8-characters-1-number-1-uppe
  PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;

  nameFormControl = new FormControl('', [
    Validators.required, 
    Validators.pattern(this.NOT_EMPTY_REGEX),
    Validators.pattern(this.NO_SPEC_CHAR_REGEX)]);

  emailFormControl = new FormControl('', [
    Validators.required, 
    Validators.pattern(this.EMAIL_REGEX)]);

  passwordFormControl = new FormControl('', [
    Validators.required, 
    Validators.pattern(this.PASSWORD_REGEX)]);

  onNoClick(): void {
    this.dialogRef.close();
  }

  loginWithGoogle() {
    this.afService.loginWithGoogle().then((data) => {
      // Send them to the homepage if they are logged in
      console.log(data);
      this.onNoClick();
    })
  }

  loginWithEmail(event, email, password){
    //event.preventDefault();
    this.afService.loginWithEmail(email, password).then(() => {
      console.log(this.afService.user.displayName);
      this.onNoClick();
    }) 
      .catch((error: any) => {
        if (error) {
          this.error = error;
          console.log(this.error);
        }
      });
  }

  changeToRegisterPage(){
    this.registerPage = true;
  }

  changeToResetPage(){
    this.resetPasswordPage = true;
  }

  //registers the user and logs them in
  register(event, name, email, password) {
    event.preventDefault();
    this.afService.registerUser(email, password).then((user) => {
      //this is needed in case of email/pw registration because firebase only provide method for registration with email and pw, 
      //which means the displayName won't be provided as well to the handler function
      this.afService.saveUserInfoFromForm(user.uid, name, email).then(() => {
        this.afService.saveUserNameInAuth(name).then(() => {
          //this.afService.displayName = name;
          this.onNoClick();
        });
      })
        .catch((error) => {
          this.error = error;
        });
    })
      .catch((error) => {
        this.error = error;
        console.log(this.error);
      });
  }

}
