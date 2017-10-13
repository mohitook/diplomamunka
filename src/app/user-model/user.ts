export class User {
    email:    string;
    photoURL: string;
    admin:    boolean;
    displayName: string;

    constructor(userData?) {
        if(userData){
            this.email    = userData.email;
            this.photoURL = userData.photoURL;
            this.displayName = userData.displayName;
            this.admin    = (userData.role.admin == true) ? true : false;
        }
        else{
            this.email = '';
            this.photoURL = '';
            this.displayName = '';
            this.admin = false;
        }
    }
  }