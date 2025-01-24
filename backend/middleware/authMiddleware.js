import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({ error: "No access token provided" });
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      req.user = user;
      next();
    } catch (error) {
      if (error.name == "TokenExpiredError") {
        return res
          .status(401)
          .json({ error: "Unauthorized - Access Token Expired" });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error in protectRoute Controller", error.message);
    return res
      .status(401)
      .json({ message: "Unauthorized - Access Token Expired" });
  }
};

export const adminRoute = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ error: "Acess Denied, admin only" });
  }
};
