/* Title: Server app.js
 */

  var cluster = require('cluster');
  var farmhash = require('farmhash');
  var num_processors = require('os').cpus().length;
  var net = require('net');
  var path = require('path');
  const bodyParser = require('body-parser');
  var cors = require('cors');
  var forceSSL = require('force-ssl-heroku');
  var jwt = require('jsonwebtoken');
  
  require('dotenv').config();
  var port = process.env.PORT || 8080;

  var middleware = async function(app){
    app.use(forceSSL);
    app.use(cors());
    app.use(express.static(__dirname + '/dist'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.get('*', function(req,res){
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  if(cluster.isMaster){
    console.log("Master",process.pid,"is running");
    var workers = [];

    var spawn = function(i){
        workers[i] = cluster.fork();
        console.log("Worker",workers[i].id,"listening on port",port,"with process",workers[i].process.pid);
        workers[i].on('exit', (code,singal) =>{
          console.log('respawning worker',i);
          spawn(i);
        });
    };
    var num_processors = process.env.WEB_CONCURRENCY || 1;
    for(var i = 0; i < num_processors; i++){
      spawn(i);
    }
    var workers_index = (ip,len) =>{
      return farmhash.fingerprint32(ip) % len;
    }
    var server = net.createServer({pauseOnConnect:true}, (connection)=>{
      var worker = workers[workers_index(connection.remoteAddress, num_processors)];
      worker.send('connection',connection);
    }).listen(port);
  }
  else{
    var express = require('express');
    var app = express();
    var http = require('http').Server(app);
    middleware(app);
    app.listen(0);
    process.on('message', (message,connection)=>{
     if(message !== 'connection'){
       return;
     }
      http.emit('connection',connection);
      module.exports = app;
     connection.resume();
    });
  }

