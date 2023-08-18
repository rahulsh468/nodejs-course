
require('dotenv').config();

const NetworkModel = require('./models/NetworkModel');
const GameModel = require('./models/GameModel');

const mongoose = require('mongoose');
mongoose.set("strictQuery", false);

// Create the database connection
mongoose.connect(process.env.MONGOOSE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.on("connected", function () {
    console.log(
        "Mongoose default connection open to " + process.env.MONGOOSE_URL
    );
});

const records = [
    {
        Network_id: 1,
        Network_name: 'Canto',
        Currency_label: '$NOTE',
        Contract_address: 'Canto address'
    },
    {
        Network_id: 2,
        Network_name: 'Base',
        Currency_label: 'USDC',
        Contract_address: 'Base address'
    },
]

const runMigration = async() => {
    let networks = {};
    try {

        for(let i=0; i<records.length; ++i) {
            const network = records[i];
            const networkNumber = network.Network_id;
            const networkName = network.Network_name;
            const result = await NetworkModel.findOneAndUpdate(
                { Network_id: networkNumber },
                network,
                { 
                    upsert: true,
                    new: true,
                },
            );

            networks = {
                ...networks,
                [networkName]: result._id 
            };
        }

        console.log("================================");
        console.log("Adding new field to existing games . . .")
        console.log("================================");

        const updated_games = await GameModel.updateMany(
            {}, 
            { 
                $set: { 
                    network: networks["Canto"] 
                } 
            }
        );
        
        console.log(`Matched ${updated_games.matchedCount} games and updated ${updated_games.modifiedCount} games`);
        console.log("================================");

        mongoose.connection.close(function () {
            console.log(
              "Mongoose default connection disconnected through app termination"
            );
            process.exit(0);
        });
    }   

    catch(error) {
        console.error('Transaction error:', error);
    }

    finally {
    }
}

runMigration();