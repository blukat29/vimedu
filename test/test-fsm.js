
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

function runTestSuite(title, testSuite) {
  QUnit.test(title, function(assert) {
    for (var i=0; i < testSuite.length; i ++) {
      runSingleTest(assert, testSuite[i]);
    }
  });
}

QUnit.module("FSM tests", {});

runTestSuite("motion keys", [
  { input:['w'], output:['w'], comment:"simple motion 'w'" },
  { input:['2','b'], output:['2','b'], comment:"motion with count '2b'" },
  { input:['g','g'], output:['gg'], comment:"two key motion 'gg'" },
  { input:['f','w'], output:['fchar'], comment:"two key motion with wildcard 'f+char'" },
]);

runTestSuite("operators", [
  { input:['d','d'], output:['d','d'], comment:"simple double operator" },
  { input:['d','2','d'], output:['d','2','d'], comment:"double operator with repetition" },
]);

