var functions = require('firebase-functions');
var requestHandler = require('request');

// // Start writing Firebase Functions
// // https://firebase.google.com/functions/write-firebase-functions

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

//global variables:
var apiKeyForCsGo = 'k772vgds4x3x875gep7cq9dh';
var apiKeyForDota2 = '4xrzt3cygq3rs5ghv4khqft7';
var apiKeyForLoL = '3atqmme9np7jwe9gbx5texn5';

//++++++++++++++++++++++++++++ 
//check in every 12 hours. If the a match doesn't have result in 8 hours from the begin_at ->
//-> give back every bet to the users
exports.matchResultCheck = functions.https.onRequest((request, response) => {

  var matches = admin.database().ref('matches');
  matches.once('value', function (matchesSnapShot) {
    matchesSnapShot.forEach(function (match) {
      if (match.val().status == 'notFuture') {
        //4800000 is 8 hours in milliseconds
        if ((match.val().begin_at + 4800000) <= new Date().getTime()) {
          admin.database().ref('bets/' + match.key).once('value', function (betSnapShot) {
            betSnapShot.forEach(function (userBet) {
              //just to secure the bets with log
              if (userBet.val().status != 'inProgress') {
                console.log('data inconsistency: ' + match.key + '/' + userBet.key);
                return;
              }
              userBet.ref.child('status').set('rejected-noResultInTime');
              //give the coins back to the users
              admin.database().ref('users/' + userBet.key).once('value', function (userSnap) {
                userSnap.ref.child('coins').set(userSnap.val().coins + userBet.val().tip)
              });
            });
          });
        }
      }
    });
  });

  response.send('process started');

})


//--------------------------- 


//++++++++++++++++++++++++++++ fiveMinuteMatchTimeCheck

//in every 5 minutes compare the current time to the matches begin_at! (less datecheck call from clients)
exports.fiveMinuteMatchTimeCheck = functions.https.onRequest((request, response) => {
  var matches = admin.database().ref('matches');
  matches.once('value', function (matchesSnapShot) {
    matchesSnapShot.forEach(function (match) {
      if (match.val().status != 'future') {
        return;
      }
      //console.log(match.val());
      if (match.val().begin_at <= new Date().getTime()) {
        console.log('rewrite status of:')
        console.log(match.val());
        match.ref.child('status').set('notFuture');
      }
    });
  });
  response.send('process started');
})
//--------------------------- fiveMinuteMatchTimeCheck


//++++++++++++++++++++++++++++ EVERY GAME resultsToDb

function resultsToDb(gameName, body) {
  console.log(gameName + ' Results to DB');

  var matches = admin.database().ref('matches');
  matches.once('value', function (matchesSnapShot) {
    matchesSnapShot.forEach(function (matchSnapShot) {
      //get the key
      var dbMatchId = matchSnapShot.key.split('-')[1];
      console.log('dbMatchId');
      console.log(dbMatchId);
      var dbMatchData = matchSnapShot.val();
      console.log(dbMatchData);
      var matchFound = false;
      var tmpMatchId;

      body.results.forEach(function (match) {
        //for log!
        tmpMatchId = match.sport_event.id;
        if (match.sport_event.id == dbMatchId) {
          console.log(match.sport_event.id + 'result process.');
          matchFound = true;
          console.log(match.sport_event.id + ' result: ' + match.sport_event_status.home_score + '/' +
            match.sport_event_status.away_score + ' | Winner: ' + match.sport_event_status.winner_id
          );
          if (match.sport_event_status.winner_id == dbMatchData.opponents.left.id) {
            admin.database().ref('matches/' + matchSnapShot.key + '/winner').set('left');
            admin.database().ref('matches/' + matchSnapShot.key + '/result').set(
              match.sport_event_status.home_score + '/' +
              match.sport_event_status.away_score
            );
          }
          else if (match.sport_event_status.winner_id == dbMatchData.opponents.right.id) {
            admin.database().ref('matches/' + matchSnapShot.key + '/winner').set('right');
            admin.database().ref('matches/' + matchSnapShot.key + '/result').set(
              match.sport_event_status.home_score + '/' +
              match.sport_event_status.away_score
            );
          }
          else {
            //todo: visszaosztani a feltett fogadásokat! ez status: abandoned esetet jelent!
            console.log(matchSnapShot.key + ' was abandoned! Bets goes back to users!');
            admin.database().ref('matches/' + matchSnapShot.key + '/winner').set('abandoned'); //the prize.. function listen!
          }

        }
      }, this);
      //this log is enough on the firebase administrator page.
      if (!matchFound) {
        console.log('WARN! Unexpected match id:' + tmpMatchId);
      }
    });
  });
  //response.send(request.body.generated_at);
}

exports.resultsCsGo = functions.https.onRequest((request, response) => {
  var currentDate = new Date();

  if (request.body.previousDayRequest == true) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  var year = currentDate.getUTCFullYear();
  var month = currentDate.getUTCMonth() + 1;
  var day = ("0" + currentDate.getUTCDate()).slice(-2);

  var requestDate = year + '-' + month + '-' + day;

  requestHandler('http://api.sportradar.us/csgo-t1/en/schedules/' + requestDate + '/results.json?api_key=' + apiKeyForCsGo, function (error, responseInner, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
      console.log(JSON.parse(body));
      resultsToDb('CS GO', JSON.parse(body));
    }
    else {
      console.log('ERROR');
      console.log(response.statusCode);
    }
    response.send(JSON.parse(body).generated_at);
  });
})

exports.resultsLoL = functions.https.onRequest((request, response) => {

  var currentDate = new Date();

  if (request.body.previousDayRequest == true) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  var year = currentDate.getUTCFullYear();
  var month = currentDate.getUTCMonth() + 1;
  var day = ("0" + currentDate.getUTCDate()).slice(-2);

  var requestDate = year + '-' + month + '-' + day;

  requestHandler('http://api.sportradar.us/lol-t1/en/schedules/' + requestDate + '/results.json?api_key=' + apiKeyForLoL, function (error, responseInner, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
      console.log(JSON.parse(body));
      resultsToDb('LoL', JSON.parse(body));
    }
    else {
      console.log('ERROR');
      console.log(response.statusCode);
    }
    response.send(JSON.parse(body).generated_at);
  });
})

exports.resultsDota2 = functions.https.onRequest((request, response) => {

  var currentDate = new Date();

  if (request.body.previousDayRequest == true) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  var year = currentDate.getUTCFullYear();
  var month = currentDate.getUTCMonth() + 1;
  var day = ("0" + currentDate.getUTCDate()).slice(-2);

  var requestDate = year + '-' + month + '-' + day;

  requestHandler('http://api.sportradar.us/dota2-t1/en/schedules/' + requestDate + '/results.json?api_key=' + apiKeyForDota2, function (error, responseInner, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
      console.log(JSON.parse(body));
      resultsToDb('Dota 2', JSON.parse(body));
    }
    else {
      console.log('ERROR');
      console.log(response.statusCode);
    }
    response.send(JSON.parse(body).generated_at);
  });
})
//--------------------------- EVERY GAME resultsToDb


//++++++++++++++++++++++++++++ EVERY GAME dailyScheduleToDb

function dailyScheduleToDb(gameName, body) {
  console.log('in method:');
  console.log(body);
  console.log(body.generated_at);
  console.log(body.sport_events);
  body.sport_events.forEach(function (match) {
    console.log(match.scheduled);

    //just to test results!
    if (new Date(match.scheduled).getTime() <= new Date().getTime() || match.status != "not_started") {
      return; //dont add matches already played/inprogress
    }

    var matches = admin.database().ref('matches');
    matches.once('value', function (matchesSnapShot) {

      matchesSnapShot.forEach(function (matchSnapShot) {
        //get the key
        var dbMatchId = matchSnapShot.key.split('-')[1];

        if (match.id == dbMatchId) {
          return; //there is already a created match in the db -> mivan ha van TBD, vagy hasonló/esetleg változás? összehasonlítás írása! 
          //Csak a bets-maradjon + az eredetileg lekreált key! mert a ../bets ehhez van igazítva!
          //logikusabb így hagyni a már megtett fogadások miatt, ráadásul TBD példát sem találni..
        }
      });
      var newObjectKey = (new Date(match.scheduled).getTime()) + '-' + match.id;
      newObjectKey = newObjectKey.replace('.', '');
      game_logo = '';
      switch (gameName) {
        case 'CS GO':
          game_logo = "https://seeklogo.com/images/C/Counter-Strike-logo-EAC70C9C3A-seeklogo.com.png"
          break;
        case 'Dota 2':
          game_logo = "https://orig05.deviantart.net/97fe/f/2013/332/c/4/dota_2_icon_by_benashvili-d6w0695.png"
          break;
        case 'LoL':
          game_logo = "https://vignette.wikia.nocookie.net/leagueoflegends/images/1/12/League_of_Legends_Icon.png/revision/latest?cb=20150402234343"
          break;
        default:
          break;
      }
      //todo: continuehere
      var stream = "";

      //select the first, 1 stream is enough on the page
      if(match.streams[0] != null){
        lastSlash = match.streams[0].url.lastIndexOf('/');
        stream = match.streams[0].url.substring(lastSlash  + 1);
      }

      admin.database().ref('matches/' + newObjectKey).set({
        begin_at: new Date(match.scheduled).getTime(),
        game: gameName,
        game_logo: game_logo,
        status: 'future',
        stream:  stream,
        opponents: {
          left: {
            id: match.competitors[0].id,
            logo: 'http:\/\/ls.sportradar.com\/ls\/crest\/big\/'
            + match.competitors[0].id.split(':')[2] + '.png',
            name: match.competitors[0].name,
            short_name: match.competitors[0].abbreviation,
            bets: 5
          },
          //todo: check if there is only one team:-> fill with 'TBD' data -> first find some an example..
          right: {
            id: match.competitors[1].id,
            logo: 'http:\/\/ls.sportradar.com\/ls\/crest\/big\/'
            + match.competitors[1].id.split(':')[2] + '.png',
            name: match.competitors[1].name,
            short_name: match.competitors[1].abbreviation,
            bets: 5
          }
        }
      });
    });
  });
  //response.send(request.body.generated_at);
}

exports.dailyScheduleCsGo = functions.https.onRequest((request, response) => {

  var currentDate = new Date();

  if (request.body.nextDayRequest == true) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  var year = currentDate.getUTCFullYear();
  var month = currentDate.getUTCMonth() + 1;
  var day = ("0" + currentDate.getUTCDate()).slice(-2);

  var requestDate = year + '-' + month + '-' + day;

  requestHandler('http://api.sportradar.us/csgo-t1/en/schedules/' + requestDate + '/schedule.json?api_key=' + apiKeyForCsGo, function (error, responseInner, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
      console.log(JSON.parse(body));
      dailyScheduleToDb('CS GO', JSON.parse(body));
    }
    else {
      console.log('ERROR');
      console.log(response.statusCode);
    }
    response.send(JSON.parse(body).generated_at);
  });
})

exports.dailyScheduleDota2 = functions.https.onRequest((request, response) => {

  var currentDate = new Date();

  if (request.body.nextDayRequest == true) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  var year = currentDate.getUTCFullYear();
  var month = currentDate.getUTCMonth() + 1;
  var day = ("0" + currentDate.getUTCDate()).slice(-2);

  var requestDate = year + '-' + month + '-' + day;

  requestHandler('http://api.sportradar.us/dota2-t1/en/schedules/' + requestDate + '/schedule.json?api_key=' + apiKeyForDota2, function (error, responseInner, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
      console.log(JSON.parse(body));
      dailyScheduleToDb('Dota 2', JSON.parse(body));
    }
    else {
      console.log('ERROR');
      console.log(response.statusCode);
    }
    response.send(JSON.parse(body).generated_at);
  });
})

exports.dailyScheduleLoL = functions.https.onRequest((request, response) => {

  var currentDate = new Date();

  if (request.body.nextDayRequest == true) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  var year = currentDate.getUTCFullYear();
  var month = currentDate.getUTCMonth() + 1;
  var day = ("0" + currentDate.getUTCDate()).slice(-2);

  var requestDate = year + '-' + month + '-' + day;

  requestHandler('http://api.sportradar.us/lol-t1/en/schedules/' + requestDate + '/schedule.json?api_key=' + apiKeyForLoL, function (error, responseInner, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
      console.log(JSON.parse(body));
      dailyScheduleToDb('LoL', JSON.parse(body));
    }
    else {
      console.log('ERROR');
      console.log(response.statusCode);
    }
    response.send(JSON.parse(body).generated_at);
  });
})

//--------------------------- EVERY GAME dailyScheduleToDb


//++++++++++++++++++++++++++++ Prize to users

//check matches/matchId/winner! if writed -> divide the prize!
exports.prizeToUsers = functions.database.ref('matches/{matchId}/winner')
  .onCreate(event => {
    //it wont happen, but in case of failures it will protect the coins
    // if(event.data.val()==null){
    //   return;
    // }

    var winner = event.data.val();

    event.data.ref.parent.once('value', function (matchSnap) {
      if (matchSnap.val().prizeDivided == null || matchSnap.val().prizeDivided != true) {
        //set it as soon as possible
        event.data.ref.parent.child('prizeDivided').set(true);
        if(winner == 'abandoned'){
          event.data.ref.parent.child('status').set('abandoned');
        }
        else{
          event.data.ref.parent.child('status').set('finished');
        }

        admin.database().ref('bets/' + matchSnap.key).once('value', function (betSnap) {
          //give back the bets to the users
          if(winner == 'abandoned'){

            admin.database().ref('users').once('value', function (userSnap) {
                userSnap.forEach(function (user) {
                  betSnap.forEach(function (userBet) {
                    if (userBet.key == user.key) {
                      admin.database().ref('users/' + user.key + '/coins').set(user.val().coins + userBet.val().tip);
                      userBet.ref.child('status').set('abandoned');
                    }
                  });
                });
            });
            return;
          }

          //logic: sum both opponents bets, and divide them between the winners
          var opponents = matchSnap.val().opponents;
          var coinSum = opponents.left.bets + opponents.right.bets;

          var userPlusCoinDict = [];

          betSnap.forEach(function (userBet) {
            if (userBet.val().team == winner) {

              var userPrize = coinSum * (userBet.val().tip / opponents[winner].bets);

              userPlusCoinDict.push({
                key: userBet.key,
                value: userPrize
              });
              userBet.ref.child('result').set('win');
            }
            else {
              userBet.ref.child('result').set('lose');
            }
            userBet.ref.child('status').set('finished');
          });


          userPlusCoinDict.forEach(function (userPlus) {
            coinSum = coinSum - Math.floor(userPlus.value);
          });

          //get the descending sort
          userPlusCoinDict.sort(function (a, b) { return (a.value > b.value) ? -1 : ((b.value > a.value) ? 1 : 0); });

          //add +1 coins till the remaining prize is 0 / or there is no remaining bets from users
          //with the +5 per sites when the init is up it will be really generous!
          userPlusCoinDict.forEach(function (userCoin) {
            if (coinSum > 0) {
              userCoin.value = Math.ceil(userCoin.value);
              coinSum--;
            }
            else {
              userCoin.value = Math.floor(userCoin.value);
            }
          });

          console.log('processing the following match:' + matchSnap.key);
          console.log('user plus coin dictionary: ');
          console.log(userPlusCoinDict);

          admin.database().ref('users').once('value', function (userSnap) {
            userPlusCoinDict.forEach(function (userCoin) {
              userSnap.forEach(function (user) {
                if (userCoin.key == user.key) {
                  admin.database().ref('users/' + user.key + '/coins').set(user.val().coins + userCoin.value);
                  admin.database().ref('bets/' + matchSnap.key + '/' + user.key + '/won').set(userCoin.value);//not tested!
                  console.log(user.val().coins + userCoin.value);
                }
              });
            });
          });
        });
      }
    });
  })
//--------------------------- Prize to users

//++++++++++++++++++++++++++++ Client triggered match time check

//the match's begindate will be the value
exports.clientBetTimeCheck = functions.database.ref('checkMatchDate/{matchId}')
  .onCreate(event => {
    //NO SNAPSOT OR ONCE... NO PROMISE! THIS FUNCTION HAS TO BE QUICK
    //it will be triggered even in case of the deletion from this function!
    if (event.data.val() == null) {
      return;
    }
    if (event.data.val() <= new Date().getTime()) {
      console.log('clientBetTimeCheck: ' + event.params.matchId);
      admin.database().ref('matches/' + event.params.matchId + '/status').set('notFuture');
    }
    event.data.ref.remove();
  })
//--------------------------- Client triggered match time check

function pendingBetsHandler(event, userId, matchId) {

  var matchId = event.data.child('matchId').val();
  //unfortunately there is no cleaner way to do it.. only with *once* scheme

  //check if the user already have bets?!
  var bet = event.data.adminRef.root.child('bets/' + matchId);

  bet.once('value', function (betSnap) {
    if (betSnap.val() != null && betSnap.val()[event.params.userID] != null
      && betSnap.val()[event.params.userID].status == 'inProgress') {
      event.data.ref.remove();
      return; //it should not modify anything.. in this case the first won't be deleted
    }

    else {
      //check the time!
      var match = event.data.adminRef.root.child('matches/' + matchId);

      match.once('value', function (matchSnap) {
        var begin_at = matchSnap.val().begin_at;
        var status = 'inProgress';
        if (matchSnap.val().begin_at <= new Date().getTime()) {
          status = 'rejected-date';

          //set match status to 'notFuture'..or something like this
          admin.database().ref('matches/' + matchId + '/status').set(
            'notFuture'
          );
          return event.data.ref.parent.parent.child('bets').child(matchId)
            .child(event.params.userID).set({
              //userId: event.data.key,
              team: event.data.child('team').val(),
              tip: event.data.child('tip').val(),
              status: status
            }).then(event.data.ref.remove());
        }

        event.data.adminRef.root.child('users/' + event.params.userID).once('value', function (userSnapshot) {
          if (userSnapshot.val().coins < event.data.child('tip').val()) {
            status = 'rejected-coin';
          }
          else {
            //modify every additional value
            newCoinOnUser = userSnapshot.val().coins - event.data.child('tip').val();
            admin.database().ref('users/' + event.params.userID + '/coins').set(newCoinOnUser);
            currentBetsOnTeam = matchSnap.val().opponents[event.data.child('team').val()].bets;
            admin.database().ref('matches/' + matchId + '/opponents/' +
              event.data.child('team').val() + '/bets').set(
              currentBetsOnTeam + event.data.child('tip').val()
              );
          }

          return event.data.ref.parent.parent.child('bets').child(matchId)
            .child(event.params.userID).set({
              //userId: event.data.key,
              team: event.data.child('team').val(),
              tip: event.data.child('tip').val(),
              status: status
            }).then(event.data.ref.remove());

        });

      });
    }
  });
}

//++++++++++++++++++++++++++++ client Bet business layer - pendingBets handling

exports.clientBetBusinessonDelete = functions.database.ref('/pendingBets/{userID}')
  .onDelete(event => {

    console.log(event.params.userID + '/' + event.params.matchId + ' deleted');

  });

exports.clientBetBusinessonCreate = functions.database.ref('/pendingBets/{userID}')
  .onCreate(event => {
    console.log(event.params.userID + '/' + event.params.matchId + ' Created');
    pendingBetsHandler(event, event.params.userID);

  });

exports.clientBetBusinessonUpdate = functions.database.ref('/pendingBets/{userID}')
  .onUpdate(event => {
    console.log('WARN! invalid operation: Update on:' + event.params.userID + '/' + event.params.matchId + '!!!');
    return;
  });

//--------------------------- client Bet business layer - pendingBets handling

//++++++++++++++++++++++++++++ HELPER FUNCTION

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}
