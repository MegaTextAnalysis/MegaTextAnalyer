const PersonalityInsightsV3 = require("watson-developer-cloud/personality-insights/v3");

class WatsonAI {
  static callWatson(input) {
    return new Promise((resolve, reject) => {
      const personalityInsights = new PersonalityInsightsV3({
        username: "fac64b94-607e-4369-b3cc-445ef0d1c9a9",
        password: "2uVkX5OLLleO",
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
        if (error) reject(new Error("Watson AI call failed."));
        else resolve(response);
      });
    });
  }
}

module.exports = WatsonAI;
