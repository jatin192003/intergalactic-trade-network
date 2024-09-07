import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { createCargo, getCargo, updateCargoQuantity } from "../controllers/cargoController.js";

const router = express.Router();

router.post("/cargo", isAuthenticated, createCargo);
router.put("/updateCargoQuantity/:shipmentId", isAuthenticated, updateCargoQuantity); // Updated route
router.get("/getCargo/:shipmentId", isAuthenticated, getCargo);

export default router;
