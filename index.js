"use strict";

const Twitter = require("twitter");
const Express = require("express");
const Credentials = require("./credentials_twitter");
//let array = ["Isis","Allahu Akbar","Caliphate","Isil","Islamic State"];
//let array2 = ["Brothers","Cut","Death"];
let array = ["Ireland","Irish","6 Nations","#IREvWAL"];
let flaggedTweets = [];
let count = 0;

let client = new Twitter({
  consumer_key: Credentials.CONSUMER_KEY,
  consumer_secret: Credentials.CONSUMER_SECRET,
  access_token_key: Credentials.ACCESS_TOKEN,
  access_token_secret: Credentials.ACCESS_SECRET
});

const server = Express();
server.listen(3000);

// Handles landing page
server.get("/", function(req, res) {
  res.send("Application running.");
});

// Handles username fetching
server.get("/:handle", function(req, res) {
  getTweets(req.params.handle, function(tweets) {
  for (let i = 0; i < array.length; i++) {
    for (let x = 0; x <= 14; x++) {
      if (tweets[x].text.includes(array[i])) {
        flaggedTweets[count]=tweets[x].text;
        count++;
      }
    }
  }
  //for (let i = 0; i < array2.length; i++) {
    for (let x = 0; x < flaggedTweets.length; x++) {
      //if(flaggedTweets[x].includes(array2[i]))
      //{
        console.log(flaggedTweets[x]);
        //count++;
      //}
    }
  //}

    console.log(count + " Keywords Recognised.");
    res.json(tweets);
  });
});


// Handles Twitter API querying
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