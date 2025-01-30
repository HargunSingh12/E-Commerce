import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getAnalyticsData = async () => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);
  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };
  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
  };
};

export const getDailySalesData = async (startDate, endDate) => {
  try {
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: 1 },
          revernue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  
    const dateArray =getDatesinRange(startDate,endDate);
    
    return dateArray.map(date=>{
      const foundData = dailySalesData.find(item=>item._id === date)
      return {
          date,
          sales:foundData?.sales || 0,
          revernue: foundData?.revernue||0
      }
    })
  } catch (error) {
    throw(error)
  }
};

function getDatesinRange(startDate,endDate){
    const dates = [];
    let currenDate = new Date(startdate);
    while(currenDate <=endDate){
        dates.push(currenDate.toISOString().split("T")[0]);
        currenDate.setDate(currenDate.getDate()+1)
    }
    return dates;
}