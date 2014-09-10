
/* global StateMachine */

var commandListEN = [
  // Motion commands. Can be used alone, or used with operator.
  { type:'motion', commands:[
    { keys:['h'],       help:'to left' },
    { keys:['j'],       help:'to down' },
    { keys:['k'],       help:'to up' },
    { keys:['l'],       help:'to right' },
    { keys:['<Left>'],  help:'to left',  keysDisp:['←'] },
    { keys:['<Down>'],  help:'to down',  keysDisp:['↓'] },
    { keys:['<Up>'],    help:'to up',    keysDisp:['↑'] },
    { keys:['<Right>'], help:'to right', keysDisp:['→'] },

    { keys:['w'],       help:'a word' },
    { keys:['b'],       help:'a word backward' },

    { keys:['0'],       help:'to start of line' },
    { keys:['$'],       help:'to end of line' },

    { keys:['g','g'],   help:'to start of file' },
    { keys:['f','char'],help:'to given character', keysDisp:['f','target'] },
  ]},
  // Operator commands. Always used with either (i) motion,
  // (ii) a modifier + text-object (iii) itself, meaning linewise operation.
  { type:'operator', commands:[
    { keys:['d'],     help:'Delete' },
    { keys:['x'],     help:'Delete', mode:'visual' },
    { keys:['y'],     help:'Yank (copy)' },
    { keys:['c'],     help:'Change' },
    { keys:['p'],     help:'Paste' },
    { keys:['>'],     help:'Indent' },
    { keys:['<'],     help:'Unindent' },
  ]},
  // Action commands. Always used alone. Each one is complete as itself.
  { type:'action', commands:[
    { keys:['i'],     help:'Switch to insert mode' },
    { keys:['x'],     help:'Delete a character', mode:'normal' },
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
    { keys:['('],     help:'Parenthesis' },
    { keys:[')'],     help:'Parenthesis' },
    { keys:['{'],     help:'Braces' },
    { keys:['}'],     help:'Braces' },
    { keys:['['],     help:'Brackets' },
    { keys:[']'],     help:'Brackets' },
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
  // v keys toggles visual mode.
  { type:'visual', commands:[
    { keys:['v'],     help:'Toggle visual mode' },
  ]},
];

// Interface to manipulate current command help at the bottom.
function HelpViewer(context) {

  var display = $("#helps-display", context);

  var getKeyObject = function(keys, help) {
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

  var append = function(keys, help) {
    display.append(getKeyObject(keys, help));
  };

  var updateLast = function(keys, help) {
    var children = display.children();
    var last = $(children[children.length - 1]);
    last.replaceWith(getKeyObject(keys, help));
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
function KeysViewer(context) {
  var display = $("#keys-display", context);

  var appendType = function(bundle) {
    var div = $("<div></div>").addClass(bundle.type);
    var title = $("<h4>"+bundle.type+"</h4>");
    div.append(title);
    display.append(div);
    return div;
  };

  var getKeyObject = function(keys, help) {
    var div = $("<div></div>");
    for (var i=0; i<keys.length; i++) {
      var key = keys[i];
      key = key.replace("<","&lt;");
      key = key.replace(">","&gt;");
      div.append($("<kbd>"+key+"</kbd>"));
    }
    var txt = $("<span>  "+help+"</span>");
    div.append(txt);

    return div;
  };

  var appendCommand = function(container, cmd) {
    container.append(getKeyObject(cmd.keys, cmd.help));
  };

  var init = function(commandList) {

    for (var i=0; i<commandList.length; i++) {
      var bundle = commandList[i];
      var container = appendType(bundle);

      for (var j=0; j<bundle.commands.length; j++) {
        var cmd = bundle.commands[j];
        appendCommand(container, cmd);
      }
    }
  };

  var update = function(filter) {
    for (var type in filter) {
      if (filter[type])
        $("."+type, display).show();
      else
        $("."+type, display).hide();
    }
  };

  return {
    init: init,
    update: update,
  };
}

// Simple model for vim command grammar.
function VimFSM(context) {
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

      { name:'nonzero',  from:'_vnone',    to:'_vrepeat'   },
      { name:'nonzero',  from:'_vrepeat',   to:'_vrepeat'   },
      { name:'zero',     from:'_vrepeat',   to:'_vrepeat'   },
  ]});
  fsm.events = ['motion','operator','action','modifier','textobj','search','ex'];

  var helpViewer = new HelpViewer(context);

  fsm.onbeforeevent = function(e, from, to) {
    if (from === '_none' || from === '_partial') {
      helpViewer.clear();
    }
    else if ((from === '_vnone' || from === '_vpartial') &&
             e !== 'operator') {
      helpViewer.clear();
      helpViewer.append(['v'], "Select");
    }
  };

  fsm.onmotion = function(e, from, to, cmd) {
    if ($.inArray(from, ['_none', '_repeat', '_partial']) >= 0) {
      helpViewer.append(cmd.keys, "Move " + cmd.help);
    }
    else {
      helpViewer.append(cmd.keys, cmd.help);
    }
  };

  // Check if double operators are the same key.
  var lastOperator = null;
  fsm.onbeforeoperator = function(e, from, to, cmd) {
    if (from === '_operator' || from === '_opRepeat') {
      if(lastOperator !== cmd.keys[0])
        return false;
      else
        lastOperator = null;
    }
    else {
      lastOperator = cmd.keys[0];
    }
  };

  fsm.onoperator = function(e, from, to ,cmd) {
    if (from === '_operator' || from === '_opRepeat') {
      helpViewer.append(cmd.keys, "This line");
    }
    else {
      helpViewer.append(cmd.keys, cmd.help);
    }
  };

  fsm.onaction = function(e, from, to, cmd) {
    helpViewer.append(cmd.keys, cmd.help);
  };

  fsm.onmodifier = function(e, from, to, cmd) {
    helpViewer.append(cmd.keys, cmd.help);
  };

  fsm.ontextobj = function(e, from, to, cmd) {
    helpViewer.append(cmd.keys, cmd.help);
  };

  fsm.onnonzero = function(e, from, to, numBuf) {
    if (from === '_none' || from === '_operator' || from === '_vnone') {
      helpViewer.append(numBuf, "Repeat "+numBuf.join('')+" times.");
    }
    else {
      helpViewer.updateLast(numBuf, "Repeat "+numBuf.join('')+" times.");
    }
  };
  fsm.onzero = fsm.onnonzero;

  fsm.onpartial = function(e, from, to, cmd) {
    if (from === '_none' || from === '_vnone') {
      helpViewer.append(cmd.keys, "...");
    }
    else {
      helpViewer.updateLast(cmd.keys, "...");
    }
  };

  fsm.onvisual = function(e, from, to, cmd) {
    if (from === '_none') {
      helpViewer.append(cmd.keys, "Select");
    }
    else if (to === '_none') {
      helpViewer.clear();
      helpViewer.append(cmd.keys, "Cancel visual mode");
    }
  };

  fsm.ondone = function() {
    helpViewer.clear();
  };

  return fsm;
}

// Outermost interface to overall help functionality.
function CommandHelper (commandList_, context) {

  var commandList = commandList_;

  var keysViewer = new KeysViewer(context);

  var fsm = new VimFSM(context);
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

  var showKeys = function() {
    var filter = [];
    for (var i=0; i<fsm.events.length; i++) {
      var e = fsm.events[i];
      if (fsm.can(e))
        filter[e] = true;
      else
        filter[e] = false;
    }
    keysViewer.update(filter);
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
      showKeys();
    }
    else {
      if (isNonzero(key) && fsm.can('nonzero') ||
          key == '0' && fsm.can('zero')) {

        // keyBuf is for command sequences, not repeat counts.
        numBuf.push(keyBuf.pop());
        if (key === '0') fsm.zero(numBuf);
        else fsm.nonzero(numBuf);
        showKeys();
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
    keysViewer.init(commandList);
  };

  var done = function() {
    showKeys();
  };

  return {
    onKey: onKey,
    onMode: onMode,
    init: init,
    done: done,
  };
}

var commandHelper = new CommandHelper(commandListEN, window.body);

