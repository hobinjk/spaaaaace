function Missile(game, id, loc, dir) {
  this.game = game;
  this.id = id;
  this.startTime = Date.now();
  this.loc = loc;
  this.vel = dir.normalized().mul(Config.MISSILE_VEL);
  this.destroyed = false;
}

Missile.prototype.update = function(gfx, dt, ships) {
  this.loc = this.loc.add(this.vel.mul(dt));
  if(this.loc.x < -20 || this.loc.x > this.game.width + 20
      || this.loc.y < -20 || this.loc.y > this.game.height + 20) {
    this.destroy();
    return;
  }
  if(!this.armed && (Date.now() - Config.MISSILE_ARM_DELAY > this.startTime)) {
    this.armed = true;
  } else {
    return;
  }
  for(var i = 0; i < ships.length; i++) {
    var ship = ships[i];
    var diff = this.loc.sub(ship.loc).magSq();
    if(diff > Config.MISSILE_TEST_RAD_SQ) continue;
    ship.makePath(gfx);
    var scavel = this.vel.normalized().mul(5);
    console.log(scavel.x+" "+scavel.y);
    if(   gfx.isPointInPath(this.loc.x - scavel.x, this.loc.y - scavel.y)
       || gfx.isPointInPath(this.loc.x + scavel.x, this.loc.y + scavel.y)) {
      this.destroy();
      ship.destroy();
    }
  }
};

Missile.prototype.draw = function(gfx) {
  var heading = Math.atan2(this.vel.y, this.vel.x);
  gfx.save();
  gfx.translate(this.loc.x, this.loc.y);
  gfx.rotate(heading);
  gfx.fillStyle = "white";
  gfx.beginPath();
  gfx.moveTo(5, 0);
  gfx.lineTo(0, 2);
  gfx.lineTo(-5, 0);
  gfx.lineTo(0, -2);
  gfx.lineTo(5, 0);
  gfx.fill();
  gfx.restore();
};

Missile.prototype.destroy = function() {
  this.destroyed = true;
};
