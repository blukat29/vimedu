
var state_display = $("#state-display");

var commandListEN = [
  // Motion commands. Can be used alone, or used with operator.
  { type:'motion', commands:[
    { keys:['h'],       help:'to left' },
    { keys:['j'],       help:'to down' },
    { keys:['k'],       help:'to up' },
    { keys:['l'],       help:'to right' },
    { keys:['<Left>'],  help:'to left' },
    { keys:['<Down>'],  help:'to down' },
    { keys:['<Up>'],    help:'to up' },
    { keys:['<Right>'], help:'to right' },

    { keys:['w'],       help:'a word' },
    { keys:['b'],       help:'a word backward' },

    { keys:['0'],       help:'to start of line' },
    { keys:['$'],       help:'to end of line' },

    { keys:['g','g'],   help:'to start of file' },
  ]},
  // Operator commands. Always used with either (i) motion,
  // (ii) a modifier + text-object (iii) itself, meaning linewise operation.
  { type:'operator', commands:[
    { keys:['d'],     help:'Delete' },
    { keys:['y'],     help:'Yank (copy)' },
    { keys:['c'],     help:'Change' },
    { keys:['p'],     help:'Paste' },
    { keys:['>'],     help:'Indent' },
    { keys:['<'],     help:'Unindent' },
  ]},
  // Action commands. Always used alone. Each one is complete as itself.
  { type:'action', commands:[
    { keys:['<Esc>'], help:'Exit to normal mode' },
    { keys:['i'],     help:'Switch to insert mode' },
    { keys:['v'],     help:'Switch to visual mode' },
    { keys:['x'],     help:'Delete a character' },
    { keys:['u'],     help:'Undo' },
    { keys:['<C-r>'], help:'Redo' },
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
];

function HelpViewer(context) {
  this.context = context;
  this.helps_display = $("#helps-display", context);
}
HelpViewer.prototype = {
  appendCommand: function(keys, help) {
    keys = keys.join('');
    keys = keys.replace("<","&lt;");
    keys = keys.replace(">","&gt;");
    var div = this.helps_display;
    var kbd = $("<div><kbd>"+keys+"</kbd></div>");
    var txt = $("<div>"+help+"</div>");
    div.append(kbd).append(txt);
  },
  clearCommands: function() {
    this.helps_display.html("");
  }
};


function VimFSM(context) {
  var fsm = StateMachine.create({
    initial:'_none',
    events: [
      { name:'motion',   from:'_none',     to:'_simpleMotion'    },
      { name:'motion',   from:'_operator', to:'_operatorsMotion' },
      { name:'operator', from:'_none',     to:'_operator'        },
      { name:'operator', from:'_operator', to:'_operatorLinewise'},
      { name:'action',   from:'_none',     to:'_action'          },
      { name:'modifier', from:'_operator', to:'_modifier'        },
      { name:'textobj',  from:'_modifier', to:'_textobj'         },
      { name:'search',   from:'_none',     to:'_search'          },
      { name:'ex',       from:'_none',     to:'_ex'              },
      { name:'done',     from:'*',         to:'_none'            },
  ]});
  var helpViewer = new HelpViewer(context);

  // Common event handler.
  function ident(x) { return x; }
  function keyHandler(helpFunc) {
    helpFunc = (typeof helpFunc !== 'undefined') ? helpFunc : ident;
    return function(e, from, to, cmd) {
      helpViewer.appendCommand(cmd.keys, helpFunc(cmd.help));
    }
  }

  fsm.onenterstate = function(e, from, to) {
    state_display.html(from + " -> " + to);
  };
  fsm.onleave_none = function(e, from, to) {
    helpViewer.clearCommands();
  }

  fsm.on_simpleMotion = keyHandler(function (help) { return "Move "+help; });
  fsm.on_operator = keyHandler();
  fsm.on_operatorLinewise = keyHandler(function (help) { return "This line"; });
  fsm.on_operatorsMotion = keyHandler();
  fsm.on_action = keyHandler();
  fsm.on_modifier = keyHandler();
  fsm.on_textobj = keyHandler();
  fsm.on_search = keyHandler();
  fsm.on_ex = keyHandler();

  return fsm;
}

function CommandHelper (commandList, context) {
  this.commandList = commandList;
  this.fsm = VimFSM(context);
  this.keyBuf = [];

  this.matchCommand = function () {

    matchList = [];
    var commandList = this.commandList;
    var fsm = this.fsm;
    var keys = this.keyBuf;

    for (var i=0; i<commandList.length; i++) {
      var bundle = commandList[i];

      if (fsm.can(bundle.type)) {
        for (var j=0; j<bundle.commands.length; j++) {
          var cmd = bundle.commands[j];

          if (compareKeys(cmd.keys, keys)) {
            cmd.type = bundle.type;
            matchList.push(cmd);
          }
        }
      }
    }
    return matchList;
  };
  function compareKeys(a, b) {
    if (a.length != b.length)
      return false;
    for (var i=0; i<a.length; i++) {
      if (a[i] != b[i])
        return false;
    }
    return true;
  }
}
CommandHelper.prototype = {

  onKey: function(key) {

    var fsm = this.fsm;
    var commandList = this.commandList;

    this.keyBuf.push(key);
    var matchList = this.matchCommand();

    if (matchList.length > 1) {
      throw ("More than one commands match:" + key);
    }
    else if (matchList.length == 1) {
      this.keyBuf = [];
      var match = matchList[0];
      fsm[match.type](match);
      return match;
    }
    else {
      return undefined;
    }
  },

  done: function() {
    this.fsm.done();
  },
}

var commandHelper = new CommandHelper(commandListEN, window.body);

