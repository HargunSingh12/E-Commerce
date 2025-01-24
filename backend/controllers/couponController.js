import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ userId: req.user._id, isActive });
    if (!coupon) {
      return res.status(404).json({ error: "No active coupon found" });
    }
    return res.json(coupon);
  } catch (error) {
    console.log("Error in getCoupon controller", error.message);
    return res.status(500).json({ error: "Server Error" });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const code = req.body;
    const coupon = await Coupon.findOne({
      code: code,
      isActive: true,
      userId: req.user._id,
    });
    if (!coupon) {
      return res.status(404).json({ error: "Not found a coupon" });
    }
    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save()
    }
    if (coupon.isActive) {
      return res.json({
        message:"Coupon is valid",
        code,
        discountPercentage
      });
    } else {
      return res.json("Not a valid coupon");
    }
  } catch (error) {
    console.log("Error in validateCoupon controller", error.message);
    return res.status(500).json({ error: "Server Error" });
  }
};
