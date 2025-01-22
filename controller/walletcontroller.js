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

module.exports = {getWalletHistory}