const DBRDAO = require('../dao/DBRDAO');
const GameService = require('./GameService');

exports.getPastState = async (gameId) => {
    try {
        const past_states = await DBRDAO.getDBRRecord(gameId);
        return past_states;
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}


// CHECK CURRENT BOARD STRING PRESENT IN STATES
const checkDBR = (current_boardString, allStates) => {
    try {
        let count = 0;
        for(let i=0; i<allStates.length; ++i) {
            const board_state = allStates[i];
            if(board_state === current_boardString) ++count;
            if(count >= 3) return { Success: true, Data: true };
        }

        return { Success: true, Data: false };
    }   

    catch(error) {
        return { Success: false, Error: error.message };
    }
}

// ADD NEW STATE
const addState = async (gameId, new_state) => {
    try {
        const past_states = await this.getPastState(gameId);
        if(!past_states.Success) throw new Error(past_states.Error);

        let updated_state = [];
        if(past_states.Data===null) updated_state = [ new_state ];
        else {
            const state = past_states.Data.pastGameStates;
            updated_state = [ ...state, new_state ];
        }
        
        const updated_record = await DBRDAO.updateDBRRecord(gameId, updated_state);
        if(!updated_record.Success) throw new Error(updated_record.Error);

        const states_array = updated_record.Data.pastGameStates;
        const checking = checkDBR(new_state, states_array);

        if(!checking.Success) throw new Error(checking.Error);
        if(checking.Data) {
            // game draw logic
            const updated_game = await GameService.updateGameById(
                gameId, 
                { 
                    status: "Completed",
                    result: "Draw",
                    message: "Threefold Repetition"
                }
            );

            return {
                Success: true,
                Status: true,
                Game: updated_game.Game
            }
        }

        return {
            Success: true,
            Status: false,
            Game: null
        };
    }

    catch(error) {
        console.log(error);
        return { Success: false, Error: error.message };
    }
}

// DESTRUCTURE BOARD AND ADD
exports.storeBoardState = async (gameId, boardString) => {
    try {
        const state = await addState(gameId, boardString);
        return state;
    }

    catch(error) {
        console.log(error)
        return { Success: false, Error: error.message };
    }
}