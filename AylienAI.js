const AYLIENTextAPI = require("aylien_textapi");
const aylienCreds = require("./credentials_aylien");

class AylienAI {
  constructor() {
    this.textapi = new AYLIENTextAPI({
      application_id: aylienCreds.APP_ID,
      application_key: aylienCreds.APP_KEY
    });
  }

  callAI(text) {
    // Create Promise for AI call
    return new Promise((resolve, reject) => {
      this.textapi.classifyByTaxonomy(
        {
          text: text,
          taxonomy: "iptc-subjectcode"
        },
        function(error, response) {
          if (!error) {
            let label = "";
            if (response.categories.length !== 0) {
              label = response.categories[0].label;
            }
            resolve(label);
          } else {
            reject(new Error("Call AI failed."));
          }
        }
      );
    });
  }
}

module.exports = AylienAI;