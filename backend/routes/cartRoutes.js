import express from "express"
import { protectRoute } from "../middleware/authMiddleware.js";
import { addToCart,deleteAllFromCart,updateQuantity,getCartProducts } from "../controllers/cartController.js";

const router = express.Router();

router.post("/",protectRoute,addToCart)
router.delete("/",protectRoute,deleteAllFromCart)
router.put("/:id",protectRoute,updateQuantity)
router.get("/",protectRoute,getCartProducts)

export default router;