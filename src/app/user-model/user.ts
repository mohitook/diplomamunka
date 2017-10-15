export class User {
    email:    string;
    photoURL: string;
    roles:    Roles;
    displayName: string;

    constructor(userData?) {
        if(userData){
            this.email    = userData.email;
            this.photoURL = userData.photoURL;
            this.displayName = userData.displayName;
            this.roles    = new Roles(userData.roles)
        }
        else{
            this.email = '';
            this.photoURL = '';
            this.displayName = '';
            this.roles = new Roles();
        }
    }
  }

  class Roles{
    admin: boolean;
    author: boolean;

    constructor(roles?){
        if(roles){
            this.admin = (roles.admin == true) ? true : false;
            this.author = (roles.author == true) ? true : false;
        }
    }
  }