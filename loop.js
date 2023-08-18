// node myFile.js

const pending_timers = [];
const pending_os_tasks = [];
const pending_operations = [];

myFile.runContents();

function shouldContinue(){
// Check One: any pending setTimeout ,setInterval,  setImmediate
// Check Two: any pending Operation system tasks(like server listenign to a port)
// Check Three: any ling running operation is still on(like readFile using fs)

return pending_timers.length || pending_os_tasks.length || pending_operations.length;
}

// Entire body executes in one 'tick' 
while(shouldContinue){

}

// Exit Back to terminal