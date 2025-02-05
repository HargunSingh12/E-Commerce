import express from"express"
import { loginController, logoutController, signupController,refreshController,getProfile } from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post('/signup',signupController)
router.post('/login',loginController)
router.post('/logout',logoutController)
router.post('/refresh-token',refreshController)
router.get('/profile',protectRoute,getProfile)
export default router