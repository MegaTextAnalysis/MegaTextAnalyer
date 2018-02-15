# MegaTextAnalyser

## Prerequisites

The folowing NPM module is required:

- `twitter`
- `express`

Install Node.js if you haven't already, `npm` comes with the installation of Node.js.

Run `npm i twitter express` to install the above module. This installs the module to the **current working directory** so run this inside the folder that has the code.

## Usage

Make sure to add your Twitter credentials to `credentials_twitter.js`.

Run `node index.js` to start the server, listening on `http://localhost:3000`.

Query list of tweets of username, append username to URL, eg. `http://localhost:3000/twitterapi`.

## TODO

- Add sentiment analysis
- Add radicalisation indicators
