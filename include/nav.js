
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
    tutorial.hashchange(hash);
  });

}());

// Opening local file.
(function() {

  if (!(window.File && window.FileReader &&
        window.FileList && window.Blob))
  {
    console.log("File upload not supported");
    return;
  }

  var input = $("#local_file");
  input.bind('change', function(e) {
    var files = e.target.files;
    if (files.length < 1)
      return;
    var f = files[0];

    console.log(f.name);
    console.log(f.size);
    console.log(f.type);

    var reader = new FileReader();
    reader.onerror = function(e) {
      console.log("Error " + e.target.error.code);
    };
    reader.onabort = function(e) {
      console.log("cancelled");
    };
    reader.onloadstart = function(e) {
      console.log("starting");
    };
    reader.onload = function(e) {
      var content = e.target.result;
      editor.setValue(content);
    };
    reader.readAsText(f);

  });

}());

// Vim settings.
(function() {

  var selectLang = $("#select-lang");
  var langList = [
      ['C/C++/C#', 'clike'], ['CSS','css'], ['HTML', 'htmlmixed'], ['Javascript', 'javascript'],
      ['Markdown', 'markdown'], ['PHP', 'php'], ['Python', 'python'], ['Ruby', 'ruby'],
      ['Scheme/Racket', 'scheme'], ['Shell script', 'shell'], ['XML', 'xml'], ['YAML', 'yaml']];
  for (var i=0; i < langList.length; i++) {
    var lang = langList[i];
    selectLang.append("<option value='" + lang[1] + "'>" + lang[0] + "</option>");
  }
  selectLang.change(function() {
    var item = selectLang.children("option").filter(":selected");
    var mode = item.val();

    if (mode === "text")
      return;

    editor.setOption("mode", mode);
    CodeMirror.modeURL = "codemirror/mode/%N/%N.js";
    CodeMirror.autoLoadMode(editor, mode);
  });

  var selectTheme = $("#select-theme");

  var themeList = ['3024-day','3024-night','ambiance','ambiance-mobile',
      'base16-dark','base16-light','blackboard','cobalt','eclipse','elegant',
      'erlang-dark','lesser-dark','mbo','mdn-like','midnight','monokai','neat',
      'neo','night','paraiso-dark','paraiso-light','pastel-on-dark','rubyblue',
      'solarized','the-matrix','tomorrow-night-eighties','twilight','vibrant-ink',
      'xq-dark','xq-light'];
  for (var i=0; i < themeList.length; i++) {
    var theme = themeList[i];
    selectTheme.append("<option value='0'>" + theme + "</option>");
  }

  selectTheme.change(function() {
    var item = selectTheme.children("option").filter(":selected");
    var theme = item.text();
    var loaded = item.val();

    // Asynchronously load theme css file.
    if (theme !== 'default' && loaded === '0') {
      var link = $("<link rel='stylesheet'/>");
      link.attr("href", "codemirror/theme/" + theme + ".css");
      $("head").append(link);
      item.val('1');
    }

    editor.setOption("theme", theme);
  });

}());

