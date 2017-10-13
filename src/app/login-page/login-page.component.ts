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
      console.log(this.afService.displayName);
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

  //registers the user and logs them in
  register(event, name, email, password) {
    event.preventDefault();
    this.afService.registerUser(email, password).then((user) => {
    //   this.afService.saveUserInfoFromForm(user.uid, name, email).then(() => {
    //     this.afService.saveUserNameInAuth(name).then(() => {
    //       this.afService.displayName = name;
    //       this.onNoClick();
    //     });
    //   })
    //     .catch((error) => {
    //       this.error = error;
    //     });
    // }

    })
      .catch((error) => {
        this.error = error;
        console.log(this.error);
      });
  }

}
