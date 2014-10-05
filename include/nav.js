
// Quest & Sandbox transition.
(function() {

  var container = $("#upper-left");
  var quest = $("#quest-list");
  var sandbox = $("#sandbox-info");
  var baseHeight = container.height() - quest.outerHeight();

  var transition = function(curr, next) {
    container.height(baseHeight + curr.outerHeight());
    curr.fadeOut(400, function() {
      next.fadeIn(400, function() {
        container.animate({
          height: baseHeight + next.outerHeight()
        }, 400);
      });
    });
  };

  var init = location.hash;
  if (init === "#sandbox") {
    quest.hide();
    sandbox.show();
  }
  else {
    quest.show();
    sandbox.hide();
  }

  $(window).on('hashchange', function() {
    var hash = location.hash;

    if (hash === "#sandbox") {
      transition(quest, sandbox);
    }
    else if (hash === "#quest") {
      transition(sandbox, quest);
    }
  });

}());

// Vim settings.
(function() {

  var selectLang = $("#select-lang");
  selectLang.change(function() {
    var item = selectLang.children("option").filter(":selected");
    console.log(item.val());
  });

  var selectTheme = $("#select-theme");
  selectTheme.change(function() {
    var item = selectTheme.children("option").filter(":selected");
    console.log(item.text());
  });

}());


