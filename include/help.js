
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
    ]});
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
      }
    }

    if (matchList.length == 0) {
      throw ("No match found:"+key)
    }
    else if (matchList.length == 1) {
      fsm[command.type];
      return matchList[0];
    }
    else
      throw ("More than one commands match:"+key)
  }
}

var commandHelper = new CommandHelper(commandListEN);

