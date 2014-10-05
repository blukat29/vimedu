
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

  var themeList = ['3024-day','3024-night','ambiance','ambiance-mobile','base16-dark','base16-light','blackboard','cobalt','eclipse','elegant','erlang-dark','lesser-dark','mbo','mdn-like','midnight','monokai','neat','neo','night','paraiso-dark','paraiso-light','pastel-on-dark','rubyblue','solarized','the-matrix','tomorrow-night-eighties','twilight','vibrant-ink','xq-dark','xq-light'];
  for (var i=0; i < themeList.length; i++) {
    var theme = themeList[i];
    selectTheme.append("<option value='0'>" + theme + "</option>");
  }

  selectTheme.change(function() {
    var item = selectTheme.children("option").filter(":selected");
    var theme = item.text();
    var loaded = item.val();

    if (theme === "default")
      return;

    // Asynchronously load theme css file.
    if (loaded === '0') {
      var link = $("<link rel='stylesheet'/>");
      link.attr("href", "codemirror/theme/" + theme + ".css");
      $("head").append(link);
      item.val('1');
    }

    editor.setOption("theme", theme);
  });

}());

