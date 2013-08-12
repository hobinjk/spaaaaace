var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    url = require('url'),
    EnemyShip = require('./EnemyShip.js'),
    Vec2 = require('./public/vec2.js');

var enemyShips = [];
var ids = [];
var shipTrackings = [];

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
  fs.readFile(__dirname+"/public/"+pathname, function(err, data) {
    if(err) {
      res.writeHead(500);
      return res.end("Error loading "+pathname);
    }
    res.writeHead(200);
    return res.end(data);
  });
}


io.sockets.on('connection', function(socket) {
  var id;
  console.log('connection!');
  socket.on('join', function(data) {
    id = data.id;
    console.log(id+" joined");
    joinShip(id);
    addEnemy();
    socket.on('update', function(data) {
      updateShip(data);
      io.sockets.volatile.emit('update', data);
     });
    ids.forEach(function(id) {
      socket.emit('join', {'id': id});
    });
  });
  socket.on('destroyed', function(data) {
    var destroyedId = data.id;
    console.log(id+" says "+destroyedId+" has been destroyed");
    deleteShip(destroyedId);
    io.sockets.emit('destroyed', data);
  });
  socket.on('missile', function(data) {
    //{dirX, dirY, locX, locY}
    launchMissile(data);
  });

  socket.on('disconnect', function() {
    io.sockets.emit('destroyed', {'id': id});
    deleteShip(id);
  });
});

var lastEnemyUpdate = Date.now();

function enemyUpdate() {
  var dt = (Date.now() - lastEnemyUpdate)/1000.0;
  enemyShips.forEach(function(enemy) {
    enemy.update(shipTrackings, dt);
    // console.log("sending "+enemy.id+" ("+enemy.loc.x+","+enemy.loc.y+")");
    var data  = {
      id: enemy.id,
      locX: enemy.loc.x,
      locY: enemy.loc.y,
      velX: enemy.vel.x,
      velY: enemy.vel.y,
      theta: enemy.theta
    };
    io.sockets.volatile.emit('update', data);
    updateShip(data);
  });
  lastEnemyUpdate = Date.now();
  setTimeout(enemyUpdate, 50);
}

enemyUpdate();

function deleteShip(id) {
  ids = ids.filter(function(oid) { return oid != id; });
  shipTrackings = shipTrackings.filter(function(data) {
    return data.id != id;
  });
  enemyShips = enemyShips.filter(function(ship) {
    return ship.id != id;
  });
}

function launchMissile(data) {
  io.sockets.volatile.emit('missile', data);
}

function joinShip(id) {
  ids.push(id);
  io.sockets.emit('join', {'id': id});
}

function updateShip(data) {
  for(var i = 0; i < shipTrackings.length; i++) {
    if(shipTrackings[i].id !== data.id) continue;
    shipTrackings[i] = {
      id: data.id,
      loc: new Vec2(data.locX, data.locY),
      vel: new Vec2(data.velX, data.velY),
      theta: data.theta
    };
    return;
  }
  shipTrackings.push({
      id: data.id,
      loc: new Vec2(data.locX, data.locY),
      vel: new Vec2(data.velX, data.velY),
      theta: data.theta
  });
}

var enemyCount = 0;
function addEnemy() {
  enemyShips.push(new EnemyShip(launchMissile, "enemy"+enemyCount, Math.random()*1000, Math.random()*600));
  joinShip("enemy"+enemyCount);
  enemyCount ++;
}

