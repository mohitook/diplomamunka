// src/app/providers/af.ts
import { Injectable, EventEmitter } from "@angular/core";
import { AngularFire, AuthProviders, AuthMethods, FirebaseListObservable, FirebaseObjectObservable, FirebaseRef } from 'angularfire2';
import { Subject } from 'rxjs/Subject';
@Injectable()
export class AF {
    public messages: FirebaseListObservable<any>;
    public news: FirebaseListObservable<any>;
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

    uidUpdate: EventEmitter<string> = new EventEmitter();

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
        this.messages = this.af.database.list('messages');
        this.news = this.af.database.list('news');
        this.labels = this.af.database.list('labels');
        this.users = this.af.database.list('users');

        this.allNews = this.af.database.list('news', {
            query: {
                orderByChild: 'labels/all',
                equalTo: true,
                limitToFirst: 2
            }
        });

        console.log(this.propertySubject.observers.length);

        //valamiért inicializáláskor nem működik, csak pl gombnyomás után -->?!
        // this.specificNews = this.af.database.list('news', {
        //     query: {
        //         orderByChild: this.propertySubject,
        //         equalTo: true,
        //         limitToFirst: 2
        //     }
        // });
        // this.propertySubject.next('labels/Dota 2');
        // console.log(this.propertySubject.observers.length);
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

    checkIfFirstLogin() {
        //check if the labels is initialized
        return this.af.database.object('users/' + this.uid + '/labels');
    }

    /**
   *
   */
    addUserInfo() {
        //We saved their auth info now save the rest to the db.
        return this.af.database.object('users/' + this.uid).set({
            displayName: this.displayName,
            email: this.email,
        });
    }

    /**
     * Logs out the current user
     */
    logout() {
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

    getUserLabels(uid){
      console.log(uid);
      this.user = this.af.database.object('/users/'+uid);
    }

    /**
     * Saves a News to the Firebase Realtime Database
     * @param text
     */
    sendNews(news) {
        console.log(news);

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

    filterBy(property: string, value) {

        this.propertySubject.next(property);
        this.valueSubject.next(value);
    }

    getUserLastSelected(){
      var queryString = 'users/'+this.uid+'/lastSelected';
      return this.af.database.object(queryString);
    }

    selectSpecificNews(property: any) {

        console.log('4');
        this.specificNews = this.af.database.list('news', {
            query: {
                orderByChild: 'labels/'+property,
                equalTo: true,
                limitToFirst: 2
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
