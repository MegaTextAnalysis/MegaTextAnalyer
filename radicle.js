"use strict";

const Twitter = require("twitter");
const Express = require("express");
const Credentials = require("./credentials_twitter");
const AYLIENTextAPI = require('aylien_textapi');
const aylienCreds = require('./credentials_aylien');
const Flags = require("./flags");
const Categories = require('./categories');

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

//Gets lists of keywords and
//categories for AI
let cat = Categories.categories;
let keys = Flags.keywords;

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
      flaggedTweet.Label = "";
      let a=i.text.toUpperCase();

      for (let j in keys) {

        if (a.indexOf(j.toUpperCase()) > -1) {
          flaggedTweet.flags.push(j);
          flaggedTweet.threatLevel+=keys[j];
        }
      }
      flaggedTweet.Label=callAI(flaggedTweet,i);
      console.log("Done AI");

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
      flaggedTweet.Label = "";
      let b = i.text.toUpperCase;

      for (let j in keys) {
        if (b.indexOf(j.toUpperCase()) > -1) {
          flaggedTweet.flags.push(j);
          flaggedTweet.threatLevel+=keys[j];
        }
      }
      flaggedTweet.Label=callAI(flaggedTweet,i);
      console.log("Done AI");

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

function callAI(flaggedTweet,i) {
	var c;
	textapi.classifyByTaxonomy(
	  {'text':i.text,
		'taxonomy': 'iptc-subjectcode'
	  },
        function(error, response) {
        	console.log("AI");
        if (error === null) {
          let x=response['categories'];
          c=(x[0].label);
          for (let z of cat)
		  {
			  if (y.indexOf(z) > -1) {
		      flaggedTweet.threatLevel += 20;
	          }
          }
        }
});
	return c;
}