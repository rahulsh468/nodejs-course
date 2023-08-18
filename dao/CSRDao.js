const CSRModel = require("../models/CSRModel");
const PrivateAddress = process.env.CANTO_PRIVATE_KEY;
exports.getCSR = async () => {
  try {
    const CSRAmount = await CSRModel.find({});
    console.log("CSR ::: ", CSRAmount);
    if (CSRAmount) {
      return { Success: true, data: CSRAmount };
    } else return { Success: false, Error: error.message };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.updateCSR = async (details) => {
  try {
    console.log("DETAILSLSL ::  ,", details);
    const newCSR = await CSRModel.findOneAndUpdate(
      {
        privateAddress: PrivateAddress,
      },
      {
        $inc: { amount: details.newCSR },
      },
      {
        new: true,
        upsert: true,
      }
    );
    console.log("CSR ::: ", newCSR);
    if (newCSR) {
      return { Success: true, data: newCSR };
    } else return { Success: false, Error: error.message };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};
