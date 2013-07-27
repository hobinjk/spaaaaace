var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    url = require('url');

app.listen(3000);

io.enable('browser client minification');
io.set('log level', 1);
// io.set('transports', ['websocket', 'flashsocket']);

var allowed = ["LocalShip.js", "Missile.js", "RemoteShip.js", "Ship.js", "config.js", "space.css", "space.html", "space.js", "vec2.js"];
function handler(req, res) {
  var pathname = url.parse(req.url).pathname.substr(1);
  if(allowed.indexOf(pathname) < 0) {
    res.writeHead(404);
    return res.end(pathname+" not found");
  }
  fs.readFile(__dirname+"/public/"+pathname, function(err, data) {
    if(err) {
      res.writeHead(500);
      return res.end("Error loading "+pathname);
    }
    res.writeHead(200);
    return res.end(data);
  });
}

var ids = [];


io.sockets.on('connection', function(socket) {
  socket.on('join', function(data) {
    var id = data.id;
    console.log(id+" joined");
    ids.push(id);
    io.sockets.emit('join', {'id': id});
    socket.on(id, function(data) {
      io.sockets.volatile.emit(id, data);
    });
    ids.forEach(function(id) {
      socket.emit('join', {'id': id});
    });
  });
  socket.on('destroyed', function(data) {
    var id = data.id;
    console.log(id+" destroyed");
    ids = ids.filter(function(oid) { return oid != id; });
  });
  socket.on('missile', function(data) {
    //{id, dirX, dirY, locX, locY}
    io.sockets.volatile.emit('missile', data);
  });
});
