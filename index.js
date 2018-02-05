"use strict";

const Twitter = require("twitter");
const Credentials = require("./credentials_twitter");
const Readline = require("readline-sync");

let client = new Twitter({
  consumer_key: Credentials.CONSUMER_KEY,
  consumer_secret: Credentials.CONSUMER_SECRET,
  access_token_key: Credentials.ACCESS_TOKEN,
  access_token_secret: Credentials.ACCESS_SECRET
});

let handle = Readline.question("Enter Twitter handle: ");
// let count = Readline.question("How many tweets: ");
console.log("\n");

client.get("statuses/user_timeline", {
  screen_name: handle,
  exclude_replies: 1,
  include_rts: 0,
  trim_user: 1
}, function(err, tweets, res) {
  if (err) {
    console.log(err);
  } else {
    for (let i of tweets) {
      console.log(i.text + "\n-----");
    }
  }
});
