var Config = {
  THRUST: 20,
  STRAFE_THRUST: 40,
  MAX_VEL: 300,
  MISSILE_TEST_RAD_SQ: 10*10,
  MISSILE_VEL: 500,
  MISSILE_ARM_DELAY: 70,
  UPDATE_DELAY: 50
};

if(typeof(module) !== "undefined") {
  module.exports = Config;
} else {
  Config.STRAFE_LEFT_KEY = KeyEvent.DOM_VK_A;
  Config.STRAFE_RIGHT_KEY = KeyEvent.DOM_VK_D;
  Config.FORWARD_KEY = KeyEvent.DOM_VK_W;
  Config.REVERSE_KEY = KeyEvent.DOM_VK_S;
}

