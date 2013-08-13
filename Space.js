var EnemyShip = require('./EnemyShip.js'),
    Vec2 = require('./public/vec2.js');

function Space(app) {
  this.io = require('socket.io').listen(app);
  this.io.enable('browser client minification');
  this.io.set('log level', 1);
  // io.set('transports', ['websocket', 'flashsocket']);
  this.enemyShips = [];
  this.ids = [];
  this.shipTrackings = [];

  this.io.sockets.on('connection', this.onConnection.bind(this));
  this.lastEnemyUpdate = Date.now();
  this.enemyCount = 0;
  this.width = 100;
  this.height = 100;
  // gonna go to spaaaaaace
}

Space.prototype.onConnection = function(socket) {
  var id;
  var self = this;
  console.log('connection!');
  socket.on('join', function(data) {
    id = data.id;
    if(data.width > self.width) {
      self.width = data.width;
    }
    if(data.height > self.height) {
      self.height = data.height;
    }
    console.log(id+" joined");
    self.joinShip(id);
    self.addEnemy();
    socket.on('update', function(data) {
      self.updateShip(data);
      self.io.sockets.volatile.emit('update', data);
     });
    self.ids.forEach(function(id) {
      socket.emit('join', {'id': id});
    });
  });
  socket.on('destroyed', function(data) {
    var destroyedId = data.id;
    console.log(id+" says "+destroyedId+" has been destroyed");
    self.deleteShip(destroyedId);
    self.io.sockets.emit('destroyed', data);
  });
  socket.on('missile', function(data) {
    //{dirX, dirY, locX, locY}
    self.launchMissile(data);
  });

  socket.on('disconnect', function() {
    self.io.sockets.emit('destroyed', {'id': id});
    self.deleteShip(id);
  });
};

Space.prototype.enemyUpdate = function() {
  var dt = (Date.now() - this.lastEnemyUpdate)/1000.0;
  this.enemyShips.forEach(function(enemy) {
    enemy.update(this.shipTrackings, dt);
    // console.log("sending "+enemy.id+" ("+enemy.loc.x+","+enemy.loc.y+")");
    var data  = {
      id: enemy.id,
      locX: enemy.loc.x,
      locY: enemy.loc.y,
      velX: enemy.vel.x,
      velY: enemy.vel.y,
      theta: enemy.theta
    };
    this.io.sockets.volatile.emit('update', data);
    this.updateShip(data);
  }.bind(this));
  this.lastEnemyUpdate = Date.now();
  setTimeout(this.enemyUpdate.bind(this), 50);
};

Space.prototype.deleteShip = function(id) {
  this.ids = this.ids.filter(function(oid) { return oid != id; });
  this.shipTrackings = this.shipTrackings.filter(function(data) {
    return data.id != id;
  });
  this.enemyShips = this.enemyShips.filter(function(ship) {
    return ship.id != id;
  });
};

Space.prototype.launchMissile = function(data) {
  this.io.sockets.volatile.emit('missile', data);
};

Space.prototype.joinShip = function(id) {
  this.ids.push(id);
  this.io.sockets.emit('join', {'id': id});
};

Space.prototype.updateShip = function(data) {
  for(var i = 0; i < this.shipTrackings.length; i++) {
    if(this.shipTrackings[i].id !== data.id) continue;
    this.shipTrackings[i] = {
      id: data.id,
      loc: new Vec2(data.locX, data.locY),
      vel: new Vec2(data.velX, data.velY),
      theta: data.theta
    };
    return;
  }
  this.shipTrackings.push({
      id: data.id,
      loc: new Vec2(data.locX, data.locY),
      vel: new Vec2(data.velX, data.velY),
      theta: data.theta
  });
};

Space.prototype.addEnemy = function() {
  this.enemyShips.push(new EnemyShip(
    this,
    "enemy"+this.enemyCount,
    Math.random()*1000,
    Math.random()*600
  ));
  this.joinShip("enemy"+this.enemyCount);
  this.enemyCount ++;
};


module.exports = Space;
