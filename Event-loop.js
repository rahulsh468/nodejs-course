const pendingTimers = [];
const pendingOsTasks = [];
const pendingOperations = [];

myFile.runContents();

function shouldContinue() {
    return pendingTimers.length || pendingOsTasks.length || pendingOperations.length;
}

while (shouldContinue()) {
    // 1) look at pendingTimers and see if any function to run

    // 2) look at pendingOsTasks and pendingOperations and call relevent callbacks

    // 3) pause executions , continue when..
    // ---a new pendingOsTasks is done
    // ---a new pendingOperations is done
    // ---a timer is about to be completed

    // 4) look at pendingTimers. call any setImmediate

    // 5) handle any 'close' events
}