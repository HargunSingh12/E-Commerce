import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from'jsonwebtoken'

const generateTokens = (userId) =>{
  const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET,{
    expiresIn:"15m",
  });
  const refreshToken = jwt.sign({userId},process.env.REFRESH_TOKEN_SECRET,{
    expiresIn:"7d"
  });
  return {accessToken,refreshToken}
};

const storeRefreshToken = async(userId,refreshToken)=>{
  await redis.set(`refresh_token:${userId}`,refreshToken,"EX",7*24*60*60)
}

const setCookies = (res,accessToken,refreshToken)=>{
  res.cookies("accessToken",accessToken,{
    httpOnly:true, // prevent XSS attacks
  })
}

export const signupController = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const userExists = await User.findOne({email});

    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    } else {
      const user = await User.create({ name, email, password });

      const {accessToken,refreshToken} = generateTokens(user._id)
      await storeRefreshToken(user._id,refreshToken)

      setCookies(res,accessToken,refreshToken)
      return res.status(201).json({ user, message: "User created successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message});
  }
};
export const loginController = async (req, res) => {
  const {name,password} = req.body;
  try {
    const checkUser = await User.findOne()
  } catch (error) {
    
  }
};
export const logoutController = async (req, res) => {
  try {
  } catch (error) {
    console.log("Error in logoutcontroller", error.message);
    res.status(500).json("Internal Server Error");
  }
};
