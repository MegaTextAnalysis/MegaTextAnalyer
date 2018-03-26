"use strict";

// Require modules
const cluster = require("cluster");
const Express = require("express");
const Datastore = require("nedb");
const SocketIO = require("socket.io");
const http = require("http");
const routes = require("./routes");

if (cluster.isMaster) {
  cluster.fork();

  cluster.on("exit", (worker, code, signal) => {
    cluster.fork();
  });
} else if (cluster.isWorker) {
  let db = new Datastore({
    filename: "./database",
    autoload: true
  });

  // Express server
  const app = Express();
  const server = http.createServer(app);
  const io = SocketIO.listen(server);

  let sock;

  app.use(Express.static("public"));
  server.listen(80);

  io.on("connection", socket => {
    sock = socket;
  });

  app.get("/user/:handle", (req, res) => {
    routes
      .getHandle(db, req.params.handle, sock)
      .then(jsonHandle => res.json(jsonHandle));
  });

  app.get("/search/:query", (req, res) => {
    routes.search(req.params.query, sock).then(jsonSearch => res.json(jsonSearch));
  });

  app.get("/db", (req, res) => {
    routes.db(db, sock).then(docs => res.json(docs));
  });
}
