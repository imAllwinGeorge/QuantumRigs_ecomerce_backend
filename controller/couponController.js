const Coupon = require("../model/couponModel");

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();

    res.status(200).json({ coupons });
  } catch (error) {
    console.log("get coupons", error.message);
    res.status(500).json("something went wrong");
  }
};

const addCoupon = async (req, res) => {
  try {
    const { values } = req.body;
    console.log(values);
    const isExist = await Coupon.findOne({ couponCode: values.couponCode });
    console.log(isExist);
    if (isExist) {
      return res.status(404).json({ message: "coupon code already exist" });
    }
    await Coupon.create({
      couponCode: values.couponCode,
      description: values.description,
      couponType: values.couponType,
      couponOffer: values.couponOffer,
      minPurchaseAmmount: values.minPurchaseAmmount,
      maxDiscountAmmount:
        values.maxDiscountAmmount || values.couponOffer,
      startingDate: values.startingDate,
      expiryDate: values.expiryDate,
    });
    res.status(201).json({ message: "coupon added successfully" });
  } catch (error) {
    console.log("add coupon", error.message);
    res.status(500).json({ message: "something went wrong" });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;

    const result = await Coupon.findByIdAndDelete({ _id: couponId });
    if (!result) {
      return res.status(404).json({ message: "coupon not found" });
    }
    res.status(200).json({ message: "coupon deleted successfully" });
  } catch (error) {
    console.log("delete coupon", error.message);
    res.status(500).json({ message: "something went wrong" });
  }
};

module.exports = { getCoupons, addCoupon, deleteCoupon };
