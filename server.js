var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    url = require('url'),
    mime = require('mime');

app.listen(3000);

io.enable('browser client minification');
io.set('log level', 1);
// io.set('transports', ['websocket', 'flashsocket']);

var allowed = fs.readdirSync(__dirname+"/public/");
function handler(req, res) {
  var pathname = url.parse(req.url).pathname.substr(1);
  if(allowed.indexOf(pathname) < 0) {
    res.writeHead(404);
    return res.end(pathname+" not found");
  }
  var filename = __dirname+"/public/"+pathname;
  var ctype = mime.lookup(filename);
  fs.readFile(filename, function(err, data) {
    if(err) {
      res.writeHead(500);
      return res.end("Error loading "+pathname);
    }
    res.writeHead(200, {"Content-Type": ctype});
    return res.end(data);
  });
}

var ids = [];


io.sockets.on('connection', function(socket) {
  var id;
  socket.on('join', function(data) {
    id = data.id;
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
    var destroyedId = data.id;
    console.log(id+" says "+destroyedId+" has been destroyed");
    ids = ids.filter(function(oid) { return oid != destroyedId; });
    io.sockets.emit('destroyed', data);
  });
  socket.on('missile', function(data) {
    //{id, dirX, dirY, locX, locY}
    io.sockets.volatile.emit('missile', data);
  });

  socket.on('disconnect', function() {
    io.sockets.emit('destroyed', {'id': id});
    ids = ids.filter(function(oid) { return oid != id; });
  });
});
