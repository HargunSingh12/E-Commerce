import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    if (products.length === 0) {
      return res.status(404).json({ error: "Products not found" });
    }
    return res.json({ products });
  } catch (error) {
    console.log("Error in getAllProducts route", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }
    featuredProducts = await Product.find({ featuredProducts: true }).lean();
    if (!featuredProducts) {
      return res.status(404).json({ error: "No featured Products found" });
    }
    // storing in redis for future use
    await redis.set("featured_products", JSON.stringify(featuredProducts));
    return res.json(featuredProducts);
  } catch (error) {
    console.log("Error in getFeaturedProducts route", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }
    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
    });
    return res.status(201).json(product);
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    return res.status(500).json({ error: "Internal Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (error) {
        return res.json({ error: error.message });
      }
    }
    await Product.findByIdAndDelete(productId);
    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $projects: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);
    res.json(products);
  } catch (error) {
    console.log("Error in getRecommenedProducts controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    res.json(products);
  } catch (error) {
    console.log("Error in getRecommenedProducts controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const toggleFeature = async (req,res) => {
  try {
      const productId = req.params.id;
      const product = await Product.findById(productId);
      if(product){
        product.isFeatured = !product.isFeatured
        const updatedProduct  = await product.save();
        await updatedFeaturedProductCache();
      }else{
        return res.status(404).json({error:"Product not found"})
      }
  } catch (error) {
    console.log("Error in toggleFeature controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updatedFeaturedProductCache() {
  try {
    const featuredProducts = await Product.find({isFeatured:true}).lean()
    await redis.set("featured-products",JSON.stringify(featuredProducts))
  } catch (error) {
    console.log("error in update cache function")
  }
}