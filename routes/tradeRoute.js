import express from "express";
import { createTrade, getTrade, updateTradeStatus } from "../controllers/tradeController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post('/trades', isAuthenticated, createTrade);
router.put('/updateTradeStatus/:transactionId', isAuthenticated, updateTradeStatus); // Keep transactionId as a path parameter
router.get('/getTrade', isAuthenticated, getTrade); // Updated to accept query parameters

export default router;
