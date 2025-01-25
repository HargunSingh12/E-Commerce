import express from "express"
import { protectRoute } from "../middleware/authMiddleware.js";
import { createCheckOutSession,checkOutSuccess } from "../controllers/paymentController.js";

const router = express.Router();

router.post('/create-checkout-session',protectRoute,createCheckOutSession)
router.post('/checkout-success',protectRoute,checkOutSuccess)

export default router;