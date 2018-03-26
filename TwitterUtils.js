const Twitter = require("twitter");
const Credentials = require("./credentials_twitter");

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
  search(query, callback) {
    this.client.get(
      "search/tweets",
      {
        q: query
      },
      function(err, tweets, res) {
        if (err) {
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
      function(err, tweets, res) {
        if (err) {
          console.log(err);
          if (err[0].code === 34) {
            socket.emit("alert", {
              alert: "User does not exist."
            });
          } else {
            socket.emit("alert", {
              alert: "Twitter username search failed."
            });
          }
        } else {
          callback(tweets);
        }
      }
    );
  }
}

module.exports = TwitterUtils;
