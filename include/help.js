
/* global StateMachine */

var commandListEN = [
  // Motion commands. Can be used alone, or used with operator.
  { type:'motion', commands:[
    { keys:['h'],       help:'to left',  familyId:'hjkl',  familyHelp:'== arrow keys' },
    { keys:['j'],       help:'to down',  familyId:'hjkl' },
    { keys:['k'],       help:'to up',    familyId:'hjkl' },
    { keys:['l'],       help:'to right', familyId:'hjkl' },

    { keys:['<Left>'],  help:'to left',  keysDisp:['←'], familyId:'arrow', familyHelp:'easy.' },
    { keys:['<Down>'],  help:'to down',  keysDisp:['↓'], familyId:'arrow' },
    { keys:['<Up>'],    help:'to up',    keysDisp:['↑'], familyId:'arrow' },
    { keys:['<Right>'], help:'to right', keysDisp:['→'], familyId:'arrow' },

    { keys:['w'],       help:'a word' },
    { keys:['b'],       help:'a word backward' },

    { keys:['0'],       help:'to start of line' },
    { keys:['$'],       help:'to end of line' },

    { keys:['g','g'],   help:'to start of file' },
    { keys:['f','char'],help:'to given character', keysDisp:['f','char'] },
  ]},
  // Operator commands. Always used with either (i) motion,
  // (ii) a modifier + text-object (iii) itself, meaning linewise operation.
  { type:'operator', commands:[
    { keys:['d'],     help:'Delete' },
    { keys:['x'],     help:'Delete', mode:'visual' },
    { keys:['y'],     help:'Yank (copy)' },
    { keys:['c'],     help:'Change' },
    { keys:['p'],     help:'Paste', mode:'visual' },
    { keys:['>'],     help:'Indent' },
    { keys:['<'],     help:'Unindent' },
  ]},
  // Action commands. Always used alone. Each one is complete as itself.
  { type:'action', commands:[
    { keys:['i'],     help:'Switch to insert mode' },
    { keys:['x'],     help:'Delete a character', mode:'normal' },
    { keys:['p'],     help:'Paste', mode:'normal' },
    { keys:['u'],     help:'Undo' },
    { keys:['<C-r>'], help:'Redo', keysDisp:['Ctrl+r']  },
  ]},
  // Modifiers. Used before text object.
  { type:'modifier', commands:[
    { keys:['a'],     help:'Around' },
    { keys:['i'],     help:'Inside' },
  ]},
  // Text objects. Used after a modifier.
  { type:'textobj', commands:[
    { keys:['w'],     help:'Word' },
    { keys:['"'],     help:'Dobule quote' },
    { keys:['\''],    help:'Single quote' },
    { keys:['('],     help:'Parenthesis', familyId:'Parenthesis', familyHelp:'Parenthesis' },
    { keys:[')'],     help:'Parenthesis', familyId:'Parenthesis' },
    { keys:['{'],     help:'Braces',      familyId:'Braces',      familyHelp:'Braces' },
    { keys:['}'],     help:'Braces',      familyId:'Braces' },
    { keys:['['],     help:'Brackets',    familyId:'Brackets',    familyHelp:'Brackets' },
    { keys:[']'],     help:'Brackets',    familyId:'Brackets' },
  ]},
  // Search commands.
  { type:'search', commands:[
    { keys:['/'],     help:'Search forward' },
  ]},
  // Ex commands.
  { type:'ex', commands:[
    { keys:[':'],     help:'Use ex command' },
  ]},
  // Esc is treated specially.
  { type:'done', commands:[
    { keys:['<Esc>'], help:'Cancel command', keysDisp:['Esc']  },
  ]},
  // Ex commands are also listed.
  { type:'exdone', commands:[
    { keys:[':q'],    help:'Exit vim' },
    { keys:[':w'],    help:'Save file' },
    { keys:[':set nu'],    help:'Turn on linenumbers' },
    { keys:[':set nonu'],  help:'Turn off linenumbers' },
  ]},
  // v keys toggles visual mode.
  { type:'visual', commands:[
    { keys:['v'],     help:'Select', mode:'normal' },
    { keys:['v'],     help:'Cancel selecting', mode:'visual' },
  ]},
];

// Interface to manipulate current command help at the bottom.
function HelpViewer(context) {

  var display = $("#helps-display", context);

  var getKeyObject = function(cmd, help) {

    var help = typeof help !== 'undefined' ? help : cmd.help;
    var keys = typeof cmd.keysDisp !== 'undefined' ? cmd.keysDisp : cmd.keys;

    var div = $("<div></div>");
    var kbd = $("<div></div>");
    for (var i=0; i<keys.length; i++) {
      var key = keys[i];
      key = key.replace("<","&lt;");
      key = key.replace(">","&gt;");
      kbd.append($("<kbd>"+key+"</kbd>"));
    }
    var txt = $("<div>"+help+"</div>");

    div.append(kbd).append(txt);
    div.addClass('help-view');
    return div;
  };

  var append = function(cmd, help) {
    display.append(getKeyObject(cmd, help));
  };

  var updateLast = function(cmd, help) {
    var children = display.children();
    var last = $(children[children.length - 1]);
    last.replaceWith(getKeyObject(cmd, help));
  };

  var clear = function() {
    display.html("");
  };

  return {
    append: append,
    updateLast: updateLast,
    clear: clear,
  };
}

// Interface to suggested keys help at the right.
function KeysViewer(context, commandList_) {
  var commandList = commandList_;
  var display = $("#keys-display", context);

  var appendKbd = function(container, cmd) {
    var keys = typeof cmd.keysDisp !== 'undefined' ? cmd.keysDisp : cmd.keys;

    for (var i=0; i<keys.length; i++) {
      var key = keys[i];
      key = key.replace("<","&lt;");
      key = key.replace(">","&gt;");
      container.append($("<kbd>"+key+"</kbd>"));
    }
  };

  var getKeyObject = function(cmd) {
    var help = cmd.help;
    var div = $("<div></div>");
    appendKbd(div, cmd);
    var txt = $("<span>  "+help+"</span>");
    div.append(txt);
    return div;
  };

  var setKeyClasses = function(type, cmd, div) {
    // Command type
    div.addClass(type);
    // Multi-key command support
    if (cmd.keys.length > 1) {
      div.addClass("partial-" + cmd.keys[0]);
    }
    else {
      div.addClass("single-key");
    }
    // Mode dependent command support
    if (!cmd.mode) {
      div.addClass("any-mode");
    }
    else {
      div.addClass(cmd.mode + "-mode");
    }
    // The common class
    div.addClass("keys-entry");
  };

  var appendHeader = function(type) {
    var div = $("<div></div>");
    div.css("background-color","#aaaaaa");
    div.html("&nbsp;&nbsp;"+type +" commands");
    div.addClass(type).addClass("keys-header");
    display.append(div);
  };

  var appendCommandFamily = function(type, id, help, member) {
    var div = $("<div></div>");
    for (var i=0; i < member.length; i ++) {
      var cmd = member[i];
      appendKbd(div, cmd);
    }
    var txt = $("<span>  "+help+"</span>");
    div.append(txt);
    setKeyClasses(type, member[0], div);
    display.append(div);
  };

  var appendCommands = function(type, commands) {

    var inFamily = false;
    var currFamilyId = null;
    var currFamilyHelp = null;
    var currFamilyMember = [];

    for (var i=0; i < commands.length; i ++) {
      var cmd = commands[i];

      // Member of some family.
      if (cmd.familyId) {
        // Start of an (another) family.
        if (cmd.familyId !== currFamilyId) {
          if (inFamily) {
              appendCommandFamily(type, currFamilyId, currFamilyHelp, currFamilyMember);
          }
          inFamily = true;
          currFamilyId = cmd.familyId;
          currFamilyHelp = cmd.familyHelp;
          currFamilyMember = [cmd];
        }
        // Current family continued.
        else {
          currFamilyMember.push(cmd);
        }
      }
      // Not a family member.
      else {
        if (inFamily) {
          inFamily = false;
          appendCommandFamily(type, currFamilyId, currFamilyHelp, currFamilyMember);
        }
        var div = getKeyObject(cmd);
        setKeyClasses(type, cmd, div);
        display.append(div);
      }
    }
    if (inFamily) {
      appendCommandFamily(type, currFamilyId, currFamilyHelp, currFamilyMember);
    }
  };

  var init = function() {
    for (var i=0; i<commandList.length; i++) {
      var type = commandList[i].type;
      var commands = commandList[i].commands;
      appendHeader(type);
      appendCommands(type, commands);
    }
  };

  var setVisibility = function(key, truthy) {
    if (truthy) {
      $("."+key, display).show();
    }
    else {
      $("."+key, display).hide();
    }
  };

  return {
    init: init,
    set: setVisibility,
  };
}

// Simple model for vim command grammar.
function VimFSM(context, commandList) {
  var fsm = StateMachine.create({
    initial:'_none',
    events: [
      { name:'motion',   from:'_none',     to:'_none'     },
      { name:'motion',   from:'_repeat',   to:'_none'     },
      { name:'motion',   from:'_opRepeat', to:'_none'     },
      { name:'motion',   from:'_operator', to:'_none'     },
      { name:'motion',   from:'_partial',  to:'_none'     },

      { name:'operator', from:'_none',     to:'_operator' },
      { name:'operator', from:'_repeat',   to:'_operator' },
      { name:'operator', from:'_opRepeat', to:'_none'     },
      { name:'operator', from:'_operator', to:'_none'     },

      { name:'action',   from:'_none',     to:'_none'     },
      { name:'action',   from:'_repeat',   to:'_none'     },

      { name:'modifier', from:'_operator', to:'_modifier' },
      { name:'textobj',  from:'_modifier', to:'_none'     },

      { name:'search',   from:'_none',     to:'_search'   },
      { name:'ex',       from:'_none',     to:'_ex'       },
      { name:'exdone',   from:'_ex',       to:'_none'     },

      { name:'done',     from:'*',         to:'_none'     },

      { name:'nonzero',  from:'_none',     to:'_repeat'   },
      { name:'nonzero',  from:'_repeat',   to:'_repeat'   },
      { name:'zero',     from:'_repeat',   to:'_repeat'   },

      { name:'nonzero',  from:'_operator', to:'_opRepeat' },
      { name:'nonzero',  from:'_opRepeat', to:'_opRepeat' },
      { name:'zero',     from:'_opRepeat', to:'_opRepeat' },

      { name:'partial',  from:'_none',     to:'_partial'  },
      { name:'partial',  from:'_partial',  to:'_partial'  },

      { name:'visual',   from:'_none',     to:'_vnone'    },
      { name:'visual',   from:'_vnone',    to:'_none'     },
      { name:'visual',   from:'_vmodifier',to:'_none'     },

      { name:'motion',   from:'_vnone',    to:'_vnone'    },
      { name:'motion',   from:'_vpartial', to:'_vnone'    },
      { name:'motion',   from:'_vrepeat',  to:'_vnone'    },
      { name:'operator', from:'_vnone',    to:'_none',    },
      { name:'modifier', from:'_vnone',    to:'_vmodifier'},
      { name:'textobj',  from:'_vmodifier',to:'_vnone'    },
      { name:'partial',  from:'_vnone',    to:'_vpartial' },

      { name:'nonzero',  from:'_vnone',    to:'_vrepeat'  },
      { name:'nonzero',  from:'_vrepeat',  to:'_vrepeat'  },
      { name:'zero',     from:'_vrepeat',  to:'_vrepeat'  },
  ]});
  fsm.events = ['motion','operator','action','modifier','textobj',
                'search','ex','visual','done','exdone'];

  var helpViewer = new HelpViewer(context);
  var keysViewer = new KeysViewer(context, commandList);
  var mode = 'normal';

  fsm.onbeforeevent = function(e, from, to) {
    if (from === '_none' || from === '_partial') {
      helpViewer.clear();
    }
    else if ((from === '_vnone' || from === '_vpartial') &&
             e !== 'operator') {
      helpViewer.clear();
      helpViewer.append({keys: ['v'], help: "Select"});
    }
  };

  fsm.onafterevent = function(e, from, to, cmd) {
    // Determine current mode.
    if (to[1] == 'v') {
      mode = 'visual';
    }
    else {
      mode = 'normal';
    }
    // Reset all visibility.
    keysViewer.set('keys-entry', false);
    // Build selectors.
    for (var i=0; i<fsm.events.length; i++) {
      var e = fsm.events[i];
      // 1. Select by type.
      //   ".motion" OR ".operator" OR ...
      var selector = e;
      if (fsm.can(e)) {
        // 2. Select by partial key prefix, if needed.
        //   ":not(.single-key).partial-g"
        if (to === '_partial' || to === '_vpartial') {
          selector += ":not(.single-key)";
          selector += ".partial-" + cmd.keys[0];
        }
        // 3. Select by mode.
        //   ".any-mode" OR ".normal-mode"
        keysViewer.set(selector + ".any-mode", true);
        keysViewer.set(selector + "." + mode + "-mode", true);
      }
    }
  };

  fsm.onmotion = function(e, from, to, cmd) {
    if ($.inArray(from, ['_none', '_repeat', '_partial']) >= 0) {
      helpViewer.append(cmd, "Move " + cmd.help);
    }
    else {
      helpViewer.append(cmd);
    }
  };

  // Check if double operators are the same key.
  var lastOperator = null;
  fsm.onbeforeoperator = function(e, from, to, cmd) {
    if (from === '_operator' || from === '_opRepeat') {
      if(lastOperator !== cmd.keys[0])
        return false; // Returning false aborts the transition.
      else
        lastOperator = null;
    }
    else {
      lastOperator = cmd.keys[0];
    }
  };

  fsm.onoperator = function(e, from, to ,cmd) {
    if (from === '_operator' || from === '_opRepeat') {
      helpViewer.append(cmd, "This line");
    }
    else {
      helpViewer.append(cmd);
    }
  };

  fsm.onaction = function(e, from, to, cmd) {
    helpViewer.append(cmd);
  };

  fsm.onmodifier = function(e, from, to, cmd) {
    helpViewer.append(cmd);
  };

  fsm.ontextobj = function(e, from, to, cmd) {
    helpViewer.append(cmd);
  };

  fsm.onnonzero = function(e, from, to, numBuf) {
    if (from === '_none' || from === '_operator' || from === '_vnone') {
      helpViewer.append({ keys: numBuf, help: "Repeat "+numBuf.join('')+" times." });
    }
    else {
      helpViewer.updateLast({ keys: numBuf, help: "Repeat "+numBuf.join('')+" times." });
    }
  };
  fsm.onzero = fsm.onnonzero;

  fsm.onpartial = function(e, from, to, cmd) {
    if (from === '_none' || from === '_vnone') {
      helpViewer.append(cmd, "...");
    }
    else {
      helpViewer.updateLast(cmd, "...");
    }
  };

  fsm.onvisual = function(e, from, to, cmd) {
    if (from === '_none') {
      helpViewer.append(cmd);
    }
    else if (to === '_none') {
      helpViewer.clear();
      helpViewer.append(cmd);
    }
  };

  fsm.ondone = function() {
    helpViewer.clear();
  };

  fsm.onexdone = function(e, from, to, cmd) {
    helpViewer.append(cmd);
  };

  fsm.initKeysViewer = function() {
    keysViewer.init();
  };

  return fsm;
}

// Outermost interface to overall help functionality.
function CommandHelper (context, commandList_) {

  var commandList = commandList_;

  var fsm = new VimFSM(context, commandList);
  var keyBuf = [];
  var numBuf = [];
  var mode = 'normal';

  var matchCommand = function () {
    var match;
    for (var i=0; i<commandList.length; i++) {
      var bundle = commandList[i];

      if (!fsm.can(bundle.type)) {
        continue;
      }
      for (var j=0; j<bundle.commands.length; j++) {
        var cmd = bundle.commands[j];

        if (compareKeys(cmd.keys, keyBuf) &&
           (!cmd.mode || cmd.mode === mode)) {
          if (match)
            throw ("Duplicate command: " + keyBuF.join());
          match = { type:bundle.type, cmd:cmd };
        }
      }
    }
    return match;
  };

  var compareKeys = function (a, b) {
    if (a.length !== b.length)
      return false;
    for (var i=0; i<a.length; i++) {
      if (a[i] !== b[i] && a[i] !== 'char')
        return false;
    }
    return true;
  };

  var matchPartial = function () {
    var matches = [];
    for (var i=0; i<commandList.length; i++) {
      var bundle = commandList[i];

      if (fsm.can(bundle.type)) {
        for (var j=0; j<bundle.commands.length; j++) {
          var cmd = bundle.commands[j];

          if (comparePartial(cmd.keys, keyBuf)) {
            matches.push({ type:bundle.type, keys:cmd.keys, help:cmd.help });
          }
        }
      }
    }
    return matches;
  };

  var comparePartial = function(a, b) {
    var minLength = (a.length < b.length)? a.length : b.length;
    if (minLength === 0)
      return false;
    for (var i=0; i<minLength; i++) {
      if (a[i] !== b[i] && a[i] !== 'char')
        return false;
    }
    return true;
  };

  var onKey = function(key) {
    keyBuf.push(key);
    var match;

    // '0' key is special case since it belongs
    // in both command and repeat.
    if (key !== '0' || numBuf.length === 0) {
      match = matchCommand();
    }

    if (match) {
      keyBuf = [];
      numBuf = [];
      var result = fsm[match.type](match.cmd);
      if (result === StateMachine.Result.CANCELLED) {
        fsm.done();
      }
    }
    else {
      if (isNonzero(key) && fsm.can('nonzero') ||
          key == '0' && fsm.can('zero')) {

        // keyBuf is for command sequences, not repeat counts.
        numBuf.push(keyBuf.pop());
        if (key === '0') fsm.zero(numBuf);
        else fsm.nonzero(numBuf);
      }
      else {
        var matches = matchPartial();
        if (matches.length === 0) {
          console.log("unknown command: " + keyBuf.join());
          keyBuf = [];
          numBuf = [];
          fsm.done();
        }
        else {
          fsm.partial({ keys:keyBuf, help:'...' });
        }
      }
    }
  };

  var onMode = function(mode_) {
    mode = mode_;
  };

  var isNonzero = function(key) {
    return (key.charCodeAt(0) >= '1'.charCodeAt(0) &&
            key.charCodeAt(0) <= '9'.charCodeAt(0));
  };

  var init = function() {
    fsm.initKeysViewer();
  };

  var done = function() {
  };

  return {
    onKey: onKey,
    onMode: onMode,
    init: init,
    done: done,
  };
}

var commandHelper = new CommandHelper(window.body, commandListEN);

