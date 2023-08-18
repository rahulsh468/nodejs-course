const { ThirdwebSDK } = require("@thirdweb-dev/sdk");
const contractABI = require("../Staking.json");
const NoteABI = require("../utils/NoteAbi.json");
const GameService = require("../services/GameService");
const CSRDao = require("../dao/CSRDao");
const MovesDAO = require("../dao/TrackMovesDAO");
const GameDao = require("../dao/GameDAO");
const { CANTO_CONTRACT_ADDRESS, CANTO_TESTNET_RPC, CANTO_PRIVATE_KEY } =
  process.env;

const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider(CANTO_TESTNET_RPC));
const account = web3.eth.accounts.privateKeyToAccount(CANTO_PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
const gasLimit = 10000000;
exports.finishGame = async ({
  gameId,
  creatorStatus,
  takerStatus,
  playerId,
  gameCall,
}) => {
  try {
    const thirdWebSdk = ThirdwebSDK.fromPrivateKey(
      CANTO_PRIVATE_KEY,
      "canto-tesnet"
    );
    const cantoContract = await thirdWebSdk.getContractFromAbi(
      CANTO_CONTRACT_ADDRESS,
      contractABI.abi
    );
    const NoteContract = await thirdWebSdk.getContractFromAbi(
      CANTO_CONTRACT_ADDRESS,
      NoteABI.abi
    );
    const gameData = await GameDao.getGameById(gameId);
    const gameContractAddress = gameData.contract_address;

    const getRoyalty = await cantoContract.call("getRoyalty", [
      gameContractAddress,
    ]);
    let royaltyValue = web3.utils.fromWei(getRoyalty.toString(), "ether");
    await CSRDao.updateCSR({ newCSR: royaltyValue });
    let gameResult;

    if (gameCall === "Draw") {
      gameResult = await GameService.acceptDraw({
        gameId: gameData._id,
        playerId: playerId,
      });
    } else if (gameCall === "Resign") {
      gameResult = await GameService.resignGame({
        gameId: gameData._id,
        playerId: playerId,
      });
    } else if (gameCall === "Timeout") {
      console.log("in timeout game");
      gameResult = await GameService.timeOut({
        gameId: gameData._id,
        playerId: playerId,
      });
    } else {
      gameResult = await GameDao.getGameById(gameId);
    }
    const allMoves = await MovesDAO.getAllMovesInString(gameId);
    // const winthdrawCall =await cantoContract.call("withdraw", [
    //   gameContractAddress,
    //   creatorStatus,
    //   takerStatus,
    //   allMoves,
    // ]);

    // console.log('wind:::' , winthdrawCall)

    // const tx = {
    //   from: thirdWebSdk,
    //   to: CANTO_CONTRACT_ADDRESS,
    //   gasLimit: gasLimit,
    //   data: winthdrawCall.encodeABI(),
    // };

    // const signedTx = await web3.eth.accounts.signTransaction(
    //   tx,
    //   CANTO_PRIVATE_KEY
    // );
    // const signedTx = await thirdWebSdk.signTransaction(tx);
    // const txHash = await thirdWebSdk.sendSignedTransaction(signedTx);
    return new Promise((resolve, reject) => {
      cantoContract.call("withdraw", [
        gameContractAddress,
        creatorStatus,
        takerStatus,
        allMoves,
      ])
        .then(async function (transectionResult) {
          
          const {receipt} = transectionResult;
          const returnedValue = receipt.logs[3].data;
          const decodedValue = web3.utils.toBN(returnedValue).toString();
          const result = await GameService.deletegame(gameId);
          if (result.Success) {
            resolve({
              Success: true,
              message: "Game has been deleted",
              Game: gameResult,
              resign: gameCall === "Resign" ? true : false,
              staleMate: false,
              draw: gameCall === "Draw" ? true : false,
              kingExposingMove: false,
              Moves: [],
              checkmate: false,
            });
          } else {
            reject({
              Success: false,
              message: "Game has not been deleted",
            });
          }
        })
        .catch(function (error) {
          reject({
            Success: false,
            message: "Game has not been deleted",
            error: error,
          });
        });
    });
  } catch (err) {
    return { Success: false, message: "Game has not been deleted", error: err };
  }
};

// class ContractService {

// constructor() {
//   this.staking = new web3.eth.Contract(
//     contractABI.abi,
//     CANTO_CONTRACT_ADDRESS
//   );
//   this.token = new web3.eth.Contract(NoteABI.abi, tokenContractAddress);
// }
//   async finishGame({ gameId, creatorStatus, takerStatus, playerId, gameCall }) {
//     try {

//       const sdk = ThirdwebSDK.fromPrivateKey(CANTO_PRIVATE_KEY , 'canto-tesnet');
//       const contract = await sdk.getContract(CANTO_CONTRACT_ADDRESS);
//       console.log("CONTRCAT IS ::: " , contract);

//       const gameData = await GameDao.getGameById(gameId);
//       const gameContractAddress = gameData.contract_address;
//       const royaltyById = await this.staking.methods
//         .getRoyalty(gameContractAddress)
//         .call({ from: account.address });
//       let encodedRoyalty = web3.utils.fromWei(royaltyById, "ether");
//       encodedRoyalty = Number(encodedRoyalty);
//       await CSRDao.updateCSR({ newCSR: encodedRoyalty });
//       let gameResult;
//       if (gameCall === "Draw") {
//         gameResult = await GameService.acceptDraw({
//           gameId: gameData._id,
//           playerId: playerId,
//         });
//       } else if (gameCall === "Resign") {
//         gameResult = await GameService.resignGame({
//           gameId: gameData._id,
//           playerId: playerId,
//         });
//       }
//        else if (gameCall === "Timeout") {
//         console.log("in timeout game");
//         gameResult = await GameService.timeOut({
//           gameId: gameData._id,
//           playerId: playerId,
//         });
//       } else {
//         gameResult = await GameDao.getGameById(gameId);
//       }
//       const allMoves = await MovesDao.getAllMovesInString(gameId)
//       const txObject = {
//         from: account.address,
//         to: CANTO_CONTRACT_ADDRESS,
//         gas: gasLimit,
//         data: this.staking.methods
//           .withdraw(gameContractAddress, creatorStatus, takerStatus , allMoves)
//           .encodeABI(),
//       };

//       const signedTx = await web3.eth.accounts.signTransaction(
//         txObject,
//         CANTO_PRIVATE_KEY
//       );
//       return new Promise((resolve, reject) => {
//         web3.eth
//           .sendSignedTransaction(signedTx.rawTransaction)
//           .on("receipt", async function (receipt) {
//             const returnedValue = receipt.logs[0].data;
//             const decodedValue = web3.utils.toBN(returnedValue).toString();
//             const result = await GameService.deletegame(gameId);
//             if (result.Success) {
//               resolve({
//                 Success: true,
//                 message: "Game has been deleted",
//                 Game: gameResult,
//                 resign: gameCall === "Resign" ? true : false,
//                 staleMate: false,
//                 draw: gameCall === "Draw" ? true : false,
//                 kingExposingMove: false,
//                 Moves: [],
//                 checkmate: false,
//               });
//             } else {
//               reject({
//                 Success: false,
//                 message: "Game has not been deleted",
//               });
//             }
//           })
//           .on("error", function (error) {
//             reject({
//               Success: false,
//               message: "Game has not been deleted",
//               error: error,
//             });
//           });
//       });
//     } catch (err) {
//       return {
//         Success: false,
//         message: "Game has not been deleted",
//         error: err,
//       };
//     }
//   }
// }

// module.exports = ContractService;
