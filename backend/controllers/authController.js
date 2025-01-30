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
  res.cookie("accessToken",accessToken,{
    httpOnly:true, // prevent XSS attacks
    secure:process.env.NODE_ENV == "production",
    sameSite:"strict", // prevent CSRF attack
    maxAge: 15*60*1000
  })
  res.cookie("refreshToken",refreshToken,{
    httpOnly:true, // prevent XSS attacks
    secure:process.env.NODE_ENV == "production",
    sameSite:"strict", // prevent CSRF attack
    maxAge: 7*24*60*60*1000
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
      return res.status(201).json({ user:{
        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role
      }, message: "User created successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message});
  }
};
export const loginController = async (req, res) => {
  
  try {
    const {email,password} = req.body;
    const user = await User.findOne({email})
    if(user && (await user.comparePassword(password))){
     const {accessToken,refreshToken} =  generateTokens(user._id)
     await storeRefreshToken(user._id,refreshToken)
     setCookies(res,accessToken,refreshToken)
     res.json({
      _id:user._id,
      name:user.name,
      email:user.email,
      role:user.role
     })
    }else{
      return res.json({message:"Invalid email or password"})
    }
  } catch (error) {
    console.log("Error in login controller:",error.message)
    return res.status(500).json({error: error.message})
  }
};
export const logoutController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if(refreshToken){
      const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
      await redis.del(`refresh_token:${decoded.userId}`)
    }
    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")
    res.json({message:"Logged out successfully"})
  } catch (error) {
    res.status(500).json({message:"server error",error:error.message})
  }
};


export const refreshController =async (req,res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
      return res.status(404).json({error:"No refresh token provided"})
    }
    const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`)

    if(storedToken !== refreshToken){
      return res.status(401).json({error:"Invalid refresh token"})
    }

    const accessToken = jwt.sign({userId:decoded.userId}, process.env.ACCESS_TOKEN_SECRET,{
      expiresIn:"15m",
    });

    res.cookie("accessToken",accessToken,{
      httpOnly:true, // prevent XSS attacks
      secure:process.env.NODE_ENV == "production",
      sameSite:"strict", // prevent CSRF attack
      maxAge: 15*60*1000
    })

    return res.json({message:"Token refreshed successfully"})
  } catch (error) {
    console.log("Error in refresh controller:",error.message)
    return res.status(500).json({error: error.message})
  }
}

export const getProfile = async (req,res) => {
  try {
    res.json(res.user)
    
  } catch (error) {
    console.log("Error in getProfile controller:",error.message)
    return res.status(500).json({error: error.message})
  }
}