// src/app/providers/af.ts
import {Injectable} from "@angular/core";
import {AngularFire, AuthProviders, AuthMethods, FirebaseListObservable,FirebaseObjectObservable} from 'angularfire2';
import { Subject } from 'rxjs/Subject';
@Injectable()
export class AF {
  public messages: FirebaseListObservable<any>;
  public news: FirebaseListObservable<any>;
  public newsTmp: FirebaseListObservable<any>;
  public allNews: FirebaseListObservable<any>;
  public users: FirebaseListObservable<any>;
  public uid: string;
  public displayName: string;
  public email: string;

  contentSubject: Subject<any>;

  constructor(public af: AngularFire) {
    this.messages = this.af.database.list('messages');
    this.news = this.af.database.list('news');
    this.newsTmp = this.af.database.list('newsTmp');

    this.newsTmp.subscribe(x=>{
      console.log(x);
    });

    this.allNews = this.af.database.list('news',{
      query: {
        orderByChild: 'labels/all',
        equalTo: true
      }
    });
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

  /**
   * Saves a News to the Firebase Realtime Database
   * @param text
   */
  sendNews(news) {
    console.log(news);

    var labelsTmp:any = {};

    news.labels.forEach(x=>{
      console.log(x);
      labelsTmp[x] = true;
    });

    console.log(labelsTmp);

    var newsSend = {
        title: news.title,
        coverImageUrl: news.coverImageUrl,
        summary: news.summary,
        labels: labelsTmp,
        creator:{
          uid: this.uid,
          displayname: this.displayName
        },
        timestamp: Date.now()


    };
    var newObjectKey = this.news.push(newsSend).key;

    const toSend = this.af.database.object(`/newscontent/${newObjectKey}`);
    toSend.set({text:news.text});


  }

  getSingleNewsByKey(key){
    //...And if you already have the data loaded in memory, the SDK won't do a network call unless the item has changed remotely.
    var item = this.af.database.object('/news/'+key);
    return item;
  }

  getNewsContent(key){
    var item = this.af.database.object('/newscontent/'+key);
    item.subscribe(x=>{
      console.log("it return many times, CHECK IT" + x);
    })
    return item;
  }

}
