<<<<<<< HEAD:radicle.js
"use strict";

const Twitter = require("twitter");
const Express = require("express");
const Credentials = require("./credentials_twitter");
// let array = ["Isis","Allahu Akbar","Caliphate","Isil","Islamic State"];
// let array2 = ["Brothers","Cut","Death"];
let array = ["Ireland", "Irish", "6 Nations", "#IREvWAL"];

let client = new Twitter({
  consumer_key: Credentials.CONSUMER_KEY,
  consumer_secret: Credentials.CONSUMER_SECRET,
  access_token_key: Credentials.ACCESS_TOKEN,
  access_token_secret: Credentials.ACCESS_SECRET
});

const server = Express();
server.listen(80);

// Handles landing page
server.get("/", function(req, res) {
  res.send("Application running.");
});

// Handles username fetching
server.get("/:handle", function(req, res) {
  let flaggedTweets = [];

  getTweets(req.params.handle, function(tweets) {
    for (let i of tweets) {
      for (let j of array) {
        if (i.text.indexOf(j) > -1) {
          console.log(i.text);
          flaggedTweets.push(j);
        }
      }
    }

    console.log(flaggedTweets);
    res.send("OK");
  });
});

// Handles Twitter API querying
function getTweets(handle, callback) {
  client.get("statuses/user_timeline", {
    screen_name: handle,
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
=======
"use strict";

const Twitter = require("twitter");
const Express = require("express");
const Credentials = require("./credentials_twitter");
const Flags = require("./flags");

let client = new Twitter({
  consumer_key: Credentials.CONSUMER_KEY,
  consumer_secret: Credentials.CONSUMER_SECRET,
  access_token_key: Credentials.ACCESS_TOKEN,
  access_token_secret: Credentials.ACCESS_SECRET
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
    jsonObj.flagged = [];
    let flaggedTweet = {};

    for (let i of tweets) {
      flaggedTweet.flags = [];
      flaggedTweet.text = i.text;
      flaggedTweet.threatLevel = 0;

      for (let j of Flags) {
        if (i.text.indexOf(j) > -1) {
          flaggedTweet.flags.push(j);
        }
      }

      if (flaggedTweet.flags.length > 0) {
        jsonObj.flagged.push(flaggedTweet);
        flaggedTweet = {};
      }
    }

    jsonObj.tweets = tweets;
    res.json(jsonObj);
  });
});

server.get("/search/:query", function(req, res) {
  search(req.params.query, function(tweets) {
    let jsonObj = {};
    jsonObj.flagged = [];
    let flaggedTweet = {};

    for (let i of tweets.statuses) {
      flaggedTweet.flags = [];
      flaggedTweet.text = i.text;
      flaggedTweet.threatLevel = 0;
      flaggedTweet.user = i.user.screen_name;

      for (let j of Flags) {
        if (i.text.indexOf(j) > -1) {
          flaggedTweet.flags.push(j);
        }
      }

      if (flaggedTweet.flags.length > 0) {
        jsonObj.flagged.push(flaggedTweet);
        flaggedTweet = {};
      }
    }

    jsonObj.tweets = tweets.statuses;
    res.json(jsonObj);
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
>>>>>>> 9a6a526212ae1a9d29a7c7e98a51b3e0d6967008:index.js
