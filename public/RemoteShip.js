function RemoteShip(game,socket,id,x,y) {
  //shitty one-off inheritance because I'm lazy
  console.log("Creating ship with id: "+id);
  Ship.call(this, game, socket, id, x, y);
  this.socket.on(id, this.onData.bind(this));
}

RemoteShip.prototype = Object.create(Ship.prototype);
RemoteShip.prototype.constructor = RemoteShip;

RemoteShip.prototype.onData = function(data) {
  this.loc.x = data.locX;
  this.loc.y = data.locY;
  this.vel.x = data.velX;
  this.vel.y = data.velY;
  this.theta = data.theta;
};


