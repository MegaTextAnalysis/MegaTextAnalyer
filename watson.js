const PersonalityInsightsV3 = require("watson-developer-cloud/personality-insights/v3");
const credentials = require("./credentials_watson.js");

class WatsonAI {
  static callWatson(input) {
    return new Promise((resolve, reject) => {
      const personalityInsights = new PersonalityInsightsV3({
        username: credentials.username,
        password: credentials.password,
        version_date: "2017-10-13"
      });

      console.log(input);

      var params = {
        // Get the content from the JSON file.
        content: input,
        content_type: "application/json",
        consumption_preferences: true,
        raw_scores: true
      };

      personalityInsights.profile(params, (error, response) => {
        console.log(error);
        if (error) {
          if (error.code === 400) {
            resolve({
              customError: true
            });
          } else {
            reject(
              Error(
                "Watson personality analysis failed. Check server console for details."
              )
            );
          }
        } else {
          resolve(response);
        }
      });
    });
  }
}

module.exports = WatsonAI;
