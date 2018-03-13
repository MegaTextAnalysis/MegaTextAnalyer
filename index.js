"use strict";

// Require modules
const Twitter = require("twitter");
const Express = require("express");
const Credentials = require("./credentials_twitter");
const AYLIENTextAPI = require("aylien_textapi");
const aylienCreds = require("./credentials_aylien");
const Flags = require("./flags");
const Categories = require("./categories");

// Twitter credentials
let client = new Twitter({
  consumer_key: Credentials.CONSUMER_KEY,
  consumer_secret: Credentials.CONSUMER_SECRET,
  access_token_key: Credentials.ACCESS_TOKEN,
  access_token_secret: Credentials.ACCESS_SECRET
});

// AI credentials
let textapi = new AYLIENTextAPI({
  application_id: aylienCreds.APP_ID,
  application_key: aylienCreds.APP_KEY
});

// Express server
const server = Express();
server.use(Express.static("public"));
server.listen(80);

// Handles landing page
server.get("/", (req, res) => {
  res.send("Application running.");
});

// Handles username fetching
server.get("/user/:handle", (req, res) => {
  getTweets(req.params.handle, (tweets) => {
    // Create return JSON object
    let jsonObj = {};

    // Create array of Promises
    let promises = [];
    jsonObj.totalRisk = 0;
    jsonObj.flagged = [];

    // Iterate over tweets and analyse
    for (let i of tweets) {
      promises.push(new Promise((resolve, reject) => {
        // Each tweet has a flagging object
        let flaggedTweet = {};
        let text = i.text;
        flaggedTweet.flags = [];
        flaggedTweet.text = text;
        flaggedTweet.threatLevel = 0;

        // Call AI to analyse tweet and chain Promises to get synchronous execution
        callAI(text)
          .then(labels => {
            // Get labels returned by AI
            flaggedTweet.label = labels;

            // Add 20 to threat level if a category is flagged
            Categories.forEach((element) => {
              if (labels.indexOf(element) > -1) {
                flaggedTweet.threatLevel += 20;
              }
            });

            return flaggedTweet;
          })
          .then(flaggedTweet => {
            // Iterate over flag words and add threat level corresponding to the flag word
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

    // Wait for Promises to finish and get total threat level
    Promise.all(promises)
      .then(array => {
        array.forEach(flagged => {
          if (flagged.flags.length > 0) {
            jsonObj.totalRisk += flagged.threatLevel;
            jsonObj.flagged.push(flagged);
          }
        });
      })
      .then(() => {
        // Sort flagged tweets by threat level
        jsonObj.flagged.sort((a, b) => {
          return b.threatLevel - a.threatLevel;
        });

        // Set to risk to 100 if over 100
        if (jsonObj.totalRisk > 100) {
          jsonObj.totalRisk = 100;
        }
        jsonObj.tweets = tweets;

        // Return JSON object
        res.json(jsonObj);
      });
  });
});

// Handles search querying
server.get("/search/:query", function(req, res) {
  search(req.params.query, function(tweets) {
    // Create return JSON object
    let jsonObj = {};

    // Create array of Promises
    let promises = [];
    jsonObj.totalRisk = 0;
    jsonObj.flagged = [];

    // Iterate over tweets and analyse
    for (let i of tweets.statuses) {
      promises.push(new Promise((resolve, reject) => {
        // Each tweet has a flagging object
        let flaggedTweet = {};
        let text = i.text;
        flaggedTweet.flags = [];
        flaggedTweet.text = text;
        flaggedTweet.threatLevel = 0;

        // Call AI to analyse tweet and chain Promises to get synchronous execution
        callAI(text)
          .then(labels => {
            // Get labels returned by AI
            flaggedTweet.label = labels;

            // Add 20 to threat level if a category is flagged
            Categories.forEach((element) => {
              if (labels.indexOf(element) > -1) {
                flaggedTweet.threatLevel += 20;
              }
            });

            return flaggedTweet;
          })
          .then(flaggedTweet => {
            // Iterate over flag words and add threat level corresponding to the flag word
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

    // Wait for Promises to finish and get total threat level
    Promise.all(promises)
      .then(array => {
        array.forEach(flagged => {
          if (flagged.flags.length > 0) {
            jsonObj.totalRisk += flagged.threatLevel;
            jsonObj.flagged.push(flagged);
          }
        });
      })
      .then(() => {
        // Sort flagged tweets by threat level
        jsonObj.flagged.sort(function(a, b) {
          return b.threatLevel - a.threatLevel;
        });

        // Set to risk to 100 if over 100
        if (jsonObj.totalRisk > 100) {
          jsonObj.totalRisk = 100;
        }

        // Return JSON object
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
  // Create Promise for AI call
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
