import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { addItemsToInventory, createInventory, getInventory, updateItemsInInventory, deleteInventory, getUserInventories, deleteItemFromInventory } from "../controllers/inventoryController.js";

const router = express.Router();

router.post('/inventory', isAuthenticated, createInventory);
router.get('/inventory/:userId/:stationId', isAuthenticated, getInventory);
router.get('/user-inventories/:userId', isAuthenticated, getUserInventories);
router.post('/inventory/:stationId/additems', isAuthenticated, addItemsToInventory);
router.put('/inventory/:stationId/updateitems/:itemId', isAuthenticated, updateItemsInInventory);
router.delete('/inventory/:userId/:stationId', isAuthenticated, deleteInventory);
router.delete('/inventory/:stationId/deleteitem/:itemId', isAuthenticated, deleteItemFromInventory);

export default router;
