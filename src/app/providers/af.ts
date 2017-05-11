// src/app/providers/af.ts
import { Injectable, EventEmitter } from "@angular/core";
import { AngularFire, AuthProviders, AuthMethods, FirebaseListObservable, FirebaseObjectObservable, FirebaseRef,FirebaseAuthState } from 'angularfire2';
import { Subject } from 'rxjs/Subject';
@Injectable()
export class AF {

    public isLoggedIn: boolean;

    public limitNumber : number = 2;

    public selectedLabel:string;

    public messages: FirebaseListObservable<any>;
    public news: FirebaseListObservable<any>;
    public comments: FirebaseListObservable<any>;
    public labels: FirebaseListObservable<any>;
    public allNews: FirebaseListObservable<any>;
    public users: FirebaseListObservable<any>;
    public user: FirebaseObjectObservable<any>;
    public specificNews: FirebaseListObservable<any>;
    public placeHolderSpecificNews: FirebaseListObservable<any>;
    public uid: string;
    public displayName: string;
    public email: string;
    public firstLogin: boolean = false;


    public propertySubject: Subject<any>;
    public valueSubject: Subject<any>;
    public commentsSubject: Subject<any>;

    uidUpdate: EventEmitter<string> = new EventEmitter();

    public authState : FirebaseAuthState;

    get uid_prop(): string {
    return this.uid;
    }
    set uid_prop(value: string) {
      this.uid = value;
      this.uidUpdate.next(value);
    }

    constructor(public af: AngularFire) {
        this.propertySubject = new Subject();
        this.valueSubject = new Subject();
        this.commentsSubject = new Subject();

        this.messages = this.af.database.list('messages');
        this.news = this.af.database.list('news');
        this.labels = this.af.database.list('labels');
        this.users = this.af.database.list('users');

        this.allNews = this.af.database.list('news', {
            query: {
                orderByChild: 'labels/All',
                equalTo: true
            }
        });

        this.af.auth.subscribe(
          (auth) =>{
            this.authState=auth;
            console.log('af auth trigger');
            if (auth == null) {
                console.log("Not Logged in.");
                this.isLoggedIn = false;
                //this.router.navigate(['login']);
            }
            else {
                console.log("Successfully Logged in.");
                // Set the Display Name and Email so we can attribute messages to them
                if (auth.google) {
                    this.displayName = auth.google.displayName;
                    this.email = auth.google.email;
                    this.uid_prop = auth.auth.uid;
                    //this.uid = auth.auth.uid; //google.uid returns something else..
                }
                else {
                    this.displayName = auth.auth.displayName;
                    this.email = auth.auth.email;
                    this.uid_prop = auth.auth.uid;
                }
                this.addUserInfo();

                this.isLoggedIn = true;
                this.user = this.af.database.object('/users/'+this.uid_prop);

            }
          }
        );

    }
    /**
     * Logs in the user
     * @returns {firebase.Promise<FirebaseAuthState>}
     */
    loginWithGoogle() {
        return this.af.auth.login({
            provider: AuthProviders.Google,
            method: AuthMethods.Popup,
        });
    }

    /**
   *
   */
    addUserInfo() {
        //We saved their auth info now save the rest to the db.
        return this.af.database.object('users/' + this.uid).update({
            displayName: this.displayName,
            email: this.email,
        });
    }

    /**
     * Logs out the current user
     */
    logout() {
        this.email = null;
        this.uid_prop = null;
        this.displayName = null;
        this.user=null;
        return this.af.auth.logout();
    }
    /**
     * Saves a message to the Firebase Realtime Database
     * @param text
     */

    sendMessage(text) {
        var message = {
            message: text,
            displayName: this.displayName,
            email: this.email,
            timestamp: Date.now()
        };
        this.messages.push(message);
    }

    setCommentsFilter(key:any){
      this.comments = this.af.database.list('comments/'+key);
      this.comments.subscribe(x=>{
        console.log('comments sub');
        console.log(x);
      });
      return this.comments;
    }

    sendComment(text) {
        var message = {
            message: text,
            displayName: this.displayName,
            email: this.email,
            timestamp: Date.now()
        };
        this.comments.push(message);
    }

    checkAndUpdateLabels(labels: Array<string>){
      this.labels.subscribe(originalList=>{
        labels.forEach(l=>{
          var isItNew = true;
          originalList.forEach(o=>{
            if(o.value == l){
              isItNew = false;
            }
          });
          if(isItNew){
            this.labels.$ref.ref.child(l).set({
              image:"https://firebasestorage.googleapis.com/v0/b/dipterv-f7bce.appspot.com/o/shortRed.png?alt=media&token=d9a9551a-b155-4813-8fa8-b25436b154e3",
              label: l,
              value: l
            })
          }
        })
      });
    }

    /**
     * Saves a News to the Firebase Realtime Database
     * @param text
     */
    sendNews(news) {

      this.checkAndUpdateLabels(news.labels);

        var labelsTmp: any = {};

        news.labels.forEach(x => {
            console.log(x);
            labelsTmp[x] = true;
        });

        console.log(labelsTmp);

        var newsSend = {
            title: news.title,
            coverImageUrl: news.coverImageUrl,
            summary: news.summary,
            labels: labelsTmp,
            creator: {
                uid: this.uid,
                displayname: this.displayName
            },
            timestamp: Date.now()

        };
        //this.news.push(newsSend).key;
        //https://github.com/angular/angularfire2/issues/144
        var newObjectKey = (1 / Date.now()) + this.uid.substring(0, 5);
        newObjectKey = newObjectKey.replace('.', '');
        console.log("newsObjectKey:");
        console.log(newObjectKey);
        //not necessary, it will just order the news on the firebase dashboard! dont affect to the items queried by child element!
        this.news.$ref.ref.child(newObjectKey).setWithPriority(newsSend, 0 - Date.now());

        //Set the timestamp as key
        //const toSet = this.af.database.object('news/' + newObjectKey);
        //toSet.set(newsSend);

        //Set the content
        const toSend = this.af.database.object(`/newscontent/${newObjectKey}`);
        toSend.set({ text: news.text });

    }

    getSingleNewsByKey(key) {
        //...And if you already have the data loaded in memory, the SDK won't do a network call unless the item has changed remotely.
        var item = this.af.database.object('/news/' + key);
        return item;
    }

    getNewsContent(key) {
        var item = this.af.database.object('/newscontent/' + key);
        item.subscribe(x => {
            console.log("it return many times, CHECK IT" + x);
        })
        return item;
    }

    setUserLabels(selectedLabels){
      this.af.database.object('/users/'+this.uid+"/labels").set(selectedLabels);
    }

    getUserLastSelected(){
      var queryString = 'users/'+this.uid+'/lastSelected';
      console.log('getUserLastSelected - '+queryString);
      return this.af.database.object(queryString);
    }

    selectSpecificNews(property: any) {
      console.log('selectSpecificNews - ' + property);
        this.specificNews = this.af.database.list('news', {
            query: {
                orderByChild: 'labels/'+property,
                equalTo: true,
                //limitToFirst: this.limitNumber //nem nyerek vele kb semmit..csak vesztek
            }
        });
        console.log(property);
        this.af.database.object('users/'+this.uid+'/lastSelected').set(property);
        return this.specificNews;
    }

    //++Email/PW Registration

    /**
   * Calls the AngularFire2 service to register a new user
   * @param model
   * @returns {firebase.Promise<void>}
   */
    registerUser(email, password) {
        console.log(email)
        return this.af.auth.createUser({
            email: email,
            password: password
        });
    }

    /**
     * Saves information to display to screen when user is logged in
     * @param uid
     * @param model
     * @returns {firebase.Promise<void>}
     */
    saveUserInfoFromForm(uid, name, email) {
        return this.af.database.object('users/' + uid).set({
            displayName: name,
            email: email,
        });
    }

    saveUserNameInAuth(name){
      return this.authState.auth.updateProfile({
            displayName: "Name here",
            photoURL: ''
          });
    }

    /**
    * Logs the user in using their Email/Password combo
    * @param email
    * @param password
    * @returns {firebase.Promise<FirebaseAuthState>}
    */
    loginWithEmail(email, password) {
        return this.af.auth.login({
            email: email,
            password: password,
        },
            {
                provider: AuthProviders.Password,
                method: AuthMethods.Password,
            });
    }
    //++Email/PW Registration

}
