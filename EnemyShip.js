var Vec2 = require("./public/vec2.js");
var Config = require("./public/config.js");
var Ship = require("./public/Ship.js");

function EnemyShip(game,id,x,y) {
  Ship.call(this, game, null, id, x, y);
  this.lastShot = 0;
  this.shotDelay = 200;
}

EnemyShip.prototype = Object.create(Ship.prototype);
EnemyShip.prototype.constructor = EnemyShip;

EnemyShip.prototype.update = function(ships, dt) {
  var shoot = false;
  var targetPoint;
  if(ships && ships.length > 0) {
    var closest = null; // ships[0];
    var closestDist = -1; // ships[0].loc.sub(this.loc).magSq();
    for(var i = 0; i < ships.length; i++) {
      if(ships[i].id == this.id) continue;
      //if(ships[i].id.indexOf("enemy") >= 0) continue;
      var testDist = ships[i].loc.sub(this.loc).magSq();
      if((testDist > closestDist) && closest) continue;
      closest = ships[i];
      closestDist = testDist;
    }

    if(closest) {
      var vel = closest.vel.normalized().mul(150);
      targetPoint = closest.loc.sub(vel);
      var shootPoint = closest.loc.add(closest.vel);
      this.target = shootPoint;
      shoot = true;
    }
  }
  if(!targetPoint) {
    targetPoint = new Vec2(
        this.game.width/2 + Math.cos(Date.now()/4000.0)*this.game.width/2.2,
        this.game.height/2 + Math.sin(Date.now()/2000.0)*this.game.height/2.2
    );
    this.target = targetPoint;
  }

  var desiredVel = targetPoint.sub(this.loc).limit(Config.MAX_VEL);
  var acc = desiredVel.sub(this.vel);
  if(this.loc.x < 0) {
    acc.x = 1000;
  } else if(this.loc.x > this.game.width) {
    acc.x = -1000;
  }
  if(this.loc.y < 0) {
    acc.y = 1000;
  } else if(this.loc.y > this.game.height) {
    acc.y = -1000;
  }
  // Limit acceleration to be fair if there are others present
  if(shoot) acc = acc.limit(Config.THRUST + Config.STRAFE_THRUST);
  this.vel = this.vel.add(acc.mul(dt));
  var dir = this.target.sub(this.loc);
  this.theta = Math.atan2(dir.y, dir.x);
  this.loc = this.loc.add(this.vel.mul(dt));

  Ship.prototype.update.call(this, dt);

  if(shoot) {
    if(this.lastShot + this.shotDelay < Date.now()) {
      this.lastShot = Date.now();
      dir = dir.limit(Config.MISSILE_VEL);
      var missLoc = this.loc.add(dir.normalized().mul(12));

      this.game.launchMissile({
        id: this.id,
        dirX: dir.x,
        dirY: dir.y,
        locX: missLoc.x,
        locY: missLoc.y
      });
    }
  }
};

if(typeof module !== "undefined") {
  module.exports = EnemyShip;
}
