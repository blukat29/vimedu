
var state_display = $("#state-display");
var helps_display = $("#helps-display");

var commandListEN = [
  { keys:['w'],     type:'motion',   help:'a word' },
  { keys:['d'],     type:'operator', help:'Delete' },
  { keys:['<Esc>'], type:'action',   help:'Exit to normal mode' },
  { keys:['x'],     type:'action',   help:'Delete a character' },
];

function CommandHelper (commandList) {
  this.fsm = StateMachine.create({
    initial:'_none',
    events: [
      { name:'motion',   from:'_none',     to:'_motion'   },
      { name:'motion',   from:'_operator', to:'_motion'   },
      { name:'operator', from:'_none',     to:'_operator' },
      { name:'done',     from:'*',         to:'_none'     },
    ],
    callbacks: {
      onenterstate: function(e, from, to) {
        state_display.html(from + " -> " + to);
      },
      on_motion: function(e, from, to, command) {
        helps_display.append("<br>"+command.help);
      },
      on_operator: function(e, from, to, command) {
        helps_display.append("<br>"+command.help);
      }
    },
  });
  this.commandList = commandList;
}
CommandHelper.prototype = {
  matchCommand: function(key) {

    var fsm = this.fsm;
    var commandList = this.commandList;
    var matchList = [];

    for (var i=0; i<commandList.length; i++) {
      command = commandList[i];
      if (command.keys[0] == key && fsm.can(command.type)) {
        matchList.push(command);
        console.log(command.type);
      }
    }

    var match;
    if (matchList.length == 0) {
      throw ("No match found:"+key)
    }
    else if (matchList.length == 1) {
      match = matchList[0];
      fsm[match.type](match);
    }
    else
      throw ("More than one commands match:"+key)
    return match;
  }
}

var commandHelper = new CommandHelper(commandListEN);

