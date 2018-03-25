const AnalysisPromise = require("./AnalysisPromise");
const TwitterUtils = require("./TwitterUtils");
const AnalysisJSON = require("./AnalysisJSON");

let twitter = new TwitterUtils();
let analysis = new AnalysisPromise();

let errorSuffix =
  " Please check server-side console for technical information.";

exports.getHandle = (db, handle, socket) => {
  console.log(socket);
  // Handles username fetching
  return new Promise((resolve, reject) => {
    twitter.getTweets(handle, socket, tweets => {
      let jsonObj = new AnalysisJSON();

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
          checkDB(db, tweets, handle, jsonObj, socket);

          resolve(jsonObj);
        })
        .catch(error => {
          console.log(error);
          socket.emit("alert", {
            alert: "AI call failed. API request limit reached."
          });
        });
    });
  });
};

exports.search = (query, socket) => {
  // Handles search querying
  return new Promise((resolve, reject) => {
    twitter.search(query, function(tweets) {
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
        socket.emit("alert", {
          alert: "Database fetching failed." + errorSuffix
        });
        console.log(err);
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
          socket.emit("alert", {
            alert: "Database search failed." + errorSuffix
          });
          console.log(err);
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
