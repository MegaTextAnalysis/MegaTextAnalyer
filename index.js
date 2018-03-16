"use strict";

// Require modules
const Express = require("express");
const AnalysisPromise = require("./AnalysisPromise");
const TwitterUtils = require("./TwitterUtils");
const Datastore = require("nedb");

let db = new Datastore({
  filename: "./database",
  autoload: true
});

let twitter = new TwitterUtils();
let analysis = new AnalysisPromise();

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
  twitter.getTweets(req.params.handle, (tweets) => {
    // Create return JSON object
    let jsonObj = {};

    jsonObj.totalRisk = 0;
    jsonObj.flagged = [];

    // Create array of Promises of analyses of tweets
    let promises = tweets.map(entries => analysis.analyse(entries.text));

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

        // Check and update database with new results
        checkDB(tweets, req.params.handle, jsonObj);

        res.json(jsonObj);
      });
  });
});

// Get database of results
server.get("/db", (req, res) => {
  db.find({}, (err, docs) => {
    if (err) {
      console.log(err);
    } else {
      res.json(docs);
    }
  });
});

// Handles search querying
server.get("/search/:query", function(req, res) {
  twitter.search(req.params.query, function(tweets) {
    // Create return JSON object
    let jsonObj = {};

    // Create array of Promises
    jsonObj.totalRisk = 0;
    jsonObj.flagged = [];

    // Iterate over tweets and analyse
    let promises = tweets.statuses.map(entries => analysis.analyse(entries.text));

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

        jsonObj.tweets = tweets;
        res.json(jsonObj);
      });
  });
});

function checkDB(tweets, handle, jsonObj) {
  if (tweets.length > 0) {
    db.find({
      username: handle
    }, (err, docs) => {
      if (err) {
        console.log(err);
      } else if (docs.length > 0) {
        // If exists, update
        db.update({
          username: handle
        }, {
          $set: {
            time: Date.now(),
            data: jsonObj
          }
        });
      } else {
        db.insert({
          username: handle,
          time: Date.now(),
          data: jsonObj
        });
      }
    });
  }
}
