const Wallet = require("../model/walletModel");


const getWalletHistory = async(req,res)=>{
    try {
        const {userId} = req.params;
        const wallet = await Wallet.findOne({userId});
        if(!wallet){
            return res.status(404).json({message:'wishlist not found'})
        }
        console.log(wallet)
        const walletTransaction = wallet?.transactionDetails.sort((a, b) => new Date(b.date) - new Date(a.date))
        res.status(200).json({walletTransaction})
    } catch (error) {
        console.log("get wallet history",error.message);
        res.status(500).json({message:'something went wrong'})
    }
}

const addMoney = async (req,res) => {
    try {
        const {amount,userId} = req.body;
        const wallet = await Wallet.findOne({userId});
        if (!wallet) {
            await Wallet.create({
              userId,
              transactionDetails: [
                {
                  type: "credit",
                  amount,
                  description: `wallet recharge`,
                },
              ],
            });
          } else {
            let details = {
              type: "credit",
              amount,
              description: `wallet recharge`,
            };
  
            wallet.transactionDetails.push(details);
            await wallet.save();
          }
          res.status(200).json({message:"wallet recharged"})
    } catch (error) {
        console.log("addmoney to wallet",error);
        res.status(500).json({message:"something went wrong"})
    }
}

module.exports = {getWalletHistory, addMoney}