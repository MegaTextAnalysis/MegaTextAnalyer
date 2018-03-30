const AnalysisPromise = require("./AnalysisPromise");
const TwitterUtils = require("./TwitterUtils");
const AnalysisJSON = require("./AnalysisJSON");
const WatsonJSON = require("./watsonJSON");
const WatsonAI = require("./watson");

let twitter = new TwitterUtils();
let analysis = new AnalysisPromise();

exports.getHandle = (db, handle, socket) => {
  // Handles username fetching
  return new Promise((resolve, reject) => {
    twitter.getTweets(handle, socket, tweets => {
      let jsonObj = new AnalysisJSON();
      let watson = new WatsonJSON();

      for (let i in tweets) {
        console.log(tweets[i].text);
        let tweet = {};
        tweet.content = tweets[i].text;
        tweet.contenttype = "text/plain";
        watson.contentItems.push(tweet);
      }

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
        });

      WatsonAI.callWatson(watson)
        .then(response => {
          if (response.customError) {
            socket.emit("alert", {
              alert:
                "Watson will not perform personality analysis on this user. There is not enough data available for analysis."
            });
          } else {
            jsonObj.watsonAnalysis = response;
          }

          // Set to risk to 100 if over 100
          if (jsonObj.totalRisk > 100) {
            jsonObj.totalRisk = 100;
          }

          jsonObj.tweets = tweets;

          // Check and update database with new results
          checkDB(db, tweets, handle, jsonObj, socket);

          resolve(jsonObj);
        })
        .catch(error => {
          console.log(error);
          socket.emit("alert", {
            alert: "Watson AI call failed. Check server console for details."
          });
        });
    });
  });
};

exports.search = query => {
  // Handles search querying
  return new Promise((resolve, reject) => {
    twitter.search(query, tweets => {
      let jsonObj = new AnalysisJSON();

      // Iterate over tweets and analyse
      let promises = tweets.statuses.map(entries =>
        analysis.analyse(entries.text)
      );

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
          resolve(jsonObj);
        });
    });
  });
};

exports.db = (db, socket) => {
  // Get database of results
  return new Promise((resolve, reject) => {
    db.find({}, (err, docs) => {
      if (err) {
        console.log(err);
        socket.emit("alert", {
          alert: "Database search failed. Check server console for details."
        });
      } else {
        resolve(docs);
      }
    });
  });
};

function checkDB(db, tweets, handle, jsonObj, socket) {
  if (tweets.length > 0) {
    db.find(
      {
        username: handle
      },
      (err, docs) => {
        if (err) {
          console.log(err);
          socket.emit("alert", {
            alert: "Database search failed. Check server console for details."
          });
        } else if (docs.length > 0) {
          // If exists, update
          db.update(
            {
              username: handle
            },
            {
              $set: {
                time: Date.now(),
                data: jsonObj
              }
            }
          );
        } else {
          db.insert({
            username: handle,
            time: Date.now(),
            data: jsonObj
          });
        }
      }
    );
  }
}
