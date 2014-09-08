
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
  var comment = test.comment || "";
  var message = test.input.toString() + " : " + comment;
  assert.deepEqual(getHelps(), test.output, message);
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
  { input:['w'], output:['w'], comment:"simple motion" },
  { input:['g','g'], output:['gg'], comment:"two key motion" },
  { input:['f','w'], output:['fchar'], comment:"two key motion with wildcard" },
  { input:['0','w'], output:['w'], comment:"zero key should not treated as count." },
  { input:['2','b'], output:['2','b'], comment:"motion with count" },
  { input:['1','0','w'], output:['10','w'] },
]);

runTestSuite("operators", [
  { input:['d','d'], output:['d','d'], comment:"simple double operator" },
  { input:['d','2','d'], output:['d','2','d'], comment:"double operator with repetition" },
  { input:['2','d','d'], output:['2','d','d'], comment:"double operator with repetition" },
  { input:['2','d','3','d'], output:['2','d','3','d'], comment:"double operator with repetition" },
  { input:['d','w'], output:['d','w'], comment:"simple operator motion" },
  { input:['1','2','d','2','0','3','w'], output:['12','d','203','w'], comment:"repeatition frenzy!" },
  { input:['d','c'], output:[], comment:"different operators in a row is an error." },
  { input:['d','2','c'], output:[], comment:"different operators in a row is an error." },
  { input:['2','d','c'], output:[], comment:"different operators in a row is an error." },
  { input:['4','d','2','c'], output:[], comment:"different operators in a row is an error." },
]);

