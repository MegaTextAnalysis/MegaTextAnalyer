"use strict";

const Twitter = require("twitter");
const Express = require("express");
const Credentials = require("./credentials_twitter");
const AYLIENTextAPI = require("aylien_textapi");
const aylienCreds = require("./credentials_aylien");
const Flags = require("./flags");
const Categories = require("./categories");

let client = new Twitter({
  consumer_key: Credentials.CONSUMER_KEY,
  consumer_secret: Credentials.CONSUMER_SECRET,
  access_token_key: Credentials.ACCESS_TOKEN,
  access_token_secret: Credentials.ACCESS_SECRET
});

let textapi = new AYLIENTextAPI({
  application_id: aylienCreds.APP_ID,
  application_key: aylienCreds.APP_KEY
});

const server = Express();
server.use(Express.static("public"));
server.listen(80);

// Handles landing page
server.get("/", function(req, res) {
  res.send("Application running.");
});

// Handles username fetching
server.get("/user/:handle", function(req, res) {
  getTweets(req.params.handle, function(tweets) {
    let jsonObj = {};
    let promises = [];
    jsonObj.totalRisk = 0;
    jsonObj.flagged = [];

    for (let i of tweets) {
      promises.push(new Promise((resolve, reject) => {
        let flaggedTweet = {};
        let text = i.text;
        flaggedTweet.flags = [];
        flaggedTweet.text = text;
        flaggedTweet.threatLevel = 0;

        callAI(text)
          .then(labels => {
            flaggedTweet.label = labels;

            Categories.forEach((element) => {
              if (labels.indexOf(element) > -1) {
                flaggedTweet.threatLevel += 20;
              }
            });

            return flaggedTweet;
          })
          .then(flaggedTweet => {
            for (let j in Flags) {
              if (text.toUpperCase().indexOf(j.toUpperCase()) > -1) {
                flaggedTweet.flags.push(j);
                flaggedTweet.threatLevel += Flags[j];
              }
            }
          })
          .then(() =>
            resolve(flaggedTweet))
          .catch(error => {
            console.log(error);
          });
      }));
    }

    Promise.all(promises)
      .then(array => {
        array.forEach(flagged => {
          if (flagged.flags.length > 0) {
            jsonObj.totalRisk+=flagged.threatLevel;
            jsonObj.flagged.push(flagged);
          }
        });
      })
      .then(() => {
        jsonObj.flagged.sort(function(a,b){
          return b.threatLevel-a.threatLevel;
        });
        jsonObj.tweets = tweets;
        res.json(jsonObj);
      });
  });
});

server.get("/search/:query", function(req, res) {
  search(req.params.query, function(tweets) {
    let jsonObj = {};
    let promises = [];
    jsonObj.totalRisk = 0;
    jsonObj.flagged = [];

    for(let i of tweets.statuses){
      promises.push(new Promise((resolve, reject) => {
        let flaggedTweet = {};
        let text = i.text;
        flaggedTweet.flags = [];
        flaggedTweet.text = text;
        flaggedTweet.threatLevel = 0;
    
        callAI(text)
          .then(labels => {
            flaggedTweet.label = labels;

            Categories.forEach((element) => {
              if (labels.indexOf(element) > -1) {
                flaggedTweet.threatLevel += 20;
              }
            });

            return flaggedTweet;
          })
          .then(flaggedTweet => {
            for (let j in Flags) {
              if (text.toUpperCase().indexOf(j.toUpperCase()) > -1) {
                flaggedTweet.flags.push(j);
                flaggedTweet.threatLevel += Flags[j];
              }
            }
          })
          .then(() =>
            resolve(flaggedTweet))
          .catch(error => {
            console.log(error);
          });
      }));
    }

    Promise.all(promises)
      .then(array => {
        array.forEach(flagged => {
          if (flagged.flags.length > 0) {
            jsonObj.totalRisk+=flagged.threatLevel;
            jsonObj.flagged.push(flagged);
          }
        });
      })
      .then(() => {
        jsonObj.flagged.sort(function(a,b){
          return b.threatLevel-a.threatLevel;
        });
        jsonObj.tweets = tweets;
        res.json(jsonObj);
      });
  });
});


// Handles timeline querying
function getTweets(handle, callback) {
  client.get("statuses/user_timeline", {
    screen_name: handle,
    exclude_replies: 1,
    include_rts: 0,
    trim_user: 1
  }, function(err, tweets, res) {
    if (err) {
      console.log(err);
    } else {
      callback(tweets);
    }
  });
}

// Handles search querying
function search(query, callback) {
  client.get("search/tweets", {
    q: query
  }, function(err, tweets, res) {
    if (err) {
      console.log(err);
    } else {
      callback(tweets);
    }
  });
}

function callAI(i) {
  return new Promise(function(resolve, reject) {
    textapi.classifyByTaxonomy({
      "text": i,
      "taxonomy": "iptc-subjectcode"
    }, function(error, response) {
      if (!error) {
        let x = response["categories"];
        let labels = x[0].label;
        resolve(labels);
      } else {
        reject(new Error("Call AI failed."));
      }
    });
  });
}