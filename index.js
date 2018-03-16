"use strict";

// Require modules
const Express = require("express");
const Datastore = require("nedb");
const AnalysisPromise = require("./AnalysisPromise");
const TwitterUtils = require("./TwitterUtils");
const AnalysisUtils = require("./AnalysisJSON");

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

// Handles username fetching
server.get("/user/:handle", (req, res) => {
  twitter.getTweets(req.params.handle, (tweets) => {
    let jsonObj = new AnalysisUtils();

    // Create array of Promises of analyses of tweets
    let promises = tweets.map(entries => analysis.analyse(entries.text));

    jsonObj = analysis.promiseAll(jsonObj, promises, tweets);

    // Check and update database with new results
    checkDB(tweets, req.params.handle, jsonObj);

    res.json(jsonObj);
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
    let jsonObj = new AnalysisUtils();

    // Iterate over tweets and analyse
    let promises = tweets.statuses.map(entries => analysis.analyse(entries.text));

    // Wait for Promises to finish apply analyses to JSON
    res.json(analysis.promiseAll(jsonObj, promises, tweets));
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
