import express from "express"
import { getAllProducts,
    createProduct,
    getFeaturedProducts,
    deleteProduct,
    getRecommendedProducts,
    getProductsByCategory,
    toggleFeature } from "../controllers/productController.js";
import { adminRoute, protectRoute } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/",protectRoute, adminRoute, getAllProducts)
router.get("/featuredProducts",getFeaturedProducts)
router.get("/category/:category",getProductsByCategory)
router.get("/recommendedProducts",getRecommendedProducts)
router.post("/create",protectRoute,adminRoute,createProduct)
router.patch("/:id",protectRoute,adminRoute,toggleFeature)
router.delete("/delete/:id",protectRoute,adminRoute,deleteProduct)

export default router