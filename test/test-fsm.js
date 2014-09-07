
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

function runSingleTest(assert, test) {
  for (var i=0; i < test.input.length ; i ++) {
    var key = test.input[i];
    commandHelper.onKey(key);
  }
  assert.deepEqual(getHelps(), test.output, test.comment);
}

var motionTests = [
  { input:['w'], output:['w'], comment:"one key motion" },
  { input:['2','b'], output:['2','b'], comment:"motion with repetition" },
  { input:['g','g'], output:['gg'], comment:"two key motion" },
];

QUnit.test("motion keys", function(assert) {
  for (var i=0; i < motionTests.length; i ++) {
    runSingleTest(assert, motionTests[i]);
  }
});

