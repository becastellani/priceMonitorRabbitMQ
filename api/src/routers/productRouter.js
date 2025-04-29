import { Router } from "express";
import validator from "../middlewares/validator.js";
import productValidator from "./productValidator.js";
import { listProducts, createProduct } from "../controllers/productController.js";

const router = Router();
router.get("/", listProducts);
router.post("/", validator(productValidator), createProduct);

export default router;