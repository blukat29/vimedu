// casperjs test --pre

casper.getFocus = function() {
  casper.page.evaluate(function() {
    editor.focus();
  });
};

casper.getHelps = function() {
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
};

casper.maybeSpecialKey = function(key) {
  var special = casper.page.event.key;
  switch (key) {
    case 'ENTER': return special.Enter;
    default: return key
  }
};


