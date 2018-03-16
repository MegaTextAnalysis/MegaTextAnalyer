const AylienAI = require("./AylienAI");
const Categories = require("./categories");
const Flags = require("./flags");

class AnalysisPromise {
  constructor() {
    this.aylien = new AylienAI();
  }

  analyse(text) {
    return new Promise((resolve, reject) => {
      // Each tweet has a flagging object
      let flaggedTweet = {};
      flaggedTweet.flags = [];
      flaggedTweet.text = text;
      flaggedTweet.threatLevel = 0;

      // Call AI to analyse tweet and chain Promises to get synchronous execution
      this.aylien.callAI(text)
        .then(labels => {
          // Get labels returned by AI
          flaggedTweet.label = labels;

          // Add 20 to threat level if a category is flagged
          Categories.forEach((element) => {
            if (labels.indexOf(element) > -1) {
              flaggedTweet.threatLevel += 20;
            }
          });

          return flaggedTweet;
        })
        .then(flaggedTweet => {
          // Iterate over flag words and add threat level corresponding to the flag word
          for (let j in Flags) {
            if (text.toUpperCase().indexOf(j.toUpperCase()) > -1) {
              flaggedTweet.flags.push(j);
              flaggedTweet.threatLevel += Flags[j];
            }
          }
        })
        .then(() =>
          resolve(flaggedTweet))
        .catch(error => {
          console.log(error);
        });
    });
  }

  promiseAll(jsonObj, promises, tweets) {
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
        return jsonObj;
      });
  }
}

module.exports = AnalysisPromise;
