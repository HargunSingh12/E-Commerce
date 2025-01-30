import express from 'express'
import { adminRoute, protectRoute } from '../middleware/authMiddleware.js';
import { getAnalyticsData, getDailySalesData } from '../controllers/analyticsController.js';



const router = express.Router();

router.get("/",protectRoute,adminRoute,async (req,res) => {
    try {
        const analyticsData = await getAnalyticsData()
        const endDate = new Date()
        const startDate = new Date(endDate.getTime()- 1000*60*60*24*7) 
        const dailySalesData = await getDailySalesData()
        res.json({
            analyticsData,
            dailySalesData
        })
    } catch (error) {
        console.log("Error in analyics routes",error.message)
    }
})

export default router

