var ch = commandHelper;

function getHelps() {
  var children = $("#helps-display").children();

  var result = [];
  for (var i = 0; i < children.length; i ++) {
    var child = children[i];
    var kbds = $("div:first", child).children();

    var keys = "";
    for (var j = 0; j < kbds.length; j ++) {
      var kbd = kbds[j];
      keys += kbd.innerHTML;
    }
    result.push(keys);
  }
  return result;
}

var motionTests = [
  { input:['w'], output:['w'], comment:"one key motion" },
  { input:['2','b'], output:['2','b'], comment:"motion with repetition" },
  { input:['g','g'], output:['gg'], comment:"two key motion" },
];

