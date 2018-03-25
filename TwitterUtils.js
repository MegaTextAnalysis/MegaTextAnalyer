const Twitter = require("twitter");
const Credentials = require("./credentials_twitter");

let errorSuffix =
  " Please check server-side console for technical information.";

class TwitterUtils {
  constructor() {
    this.client = new Twitter({
      consumer_key: Credentials.CONSUMER_KEY,
      consumer_secret: Credentials.CONSUMER_SECRET,
      access_token_key: Credentials.ACCESS_TOKEN,
      access_token_secret: Credentials.ACCESS_SECRET
    });
  }

  // Handle keyword searching
  search(query, socket, callback) {
    this.client.get(
      "search/tweets",
      {
        q: query
      },
      (err, tweets, res) => {
        if (err) {
          socket.emit("alert", {
            alert: "Twitter search failed." + errorSuffix
          });
          console.log(err);
        } else {
          callback(tweets);
        }
      }
    );
  }

  // Handle user searching
  getTweets(handle, socket, callback) {
    this.client.get(
      "statuses/user_timeline",
      {
        screen_name: handle,
        exclude_replies: 1,
        include_rts: 0,
        trim_user: 1
      },
      (err, tweets, res) => {
        if (err) {
          socket.emit("alert", {
            alert: "Twitter user fetching failed." + errorSuffix
          });
          console.log(err);
        } else {
          callback(tweets);
        }
      }
    );
  }
}

module.exports = TwitterUtils;
