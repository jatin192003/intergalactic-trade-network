import { Trade } from "../models/trade.model.js";
import { Inventory } from "../models/inventory.model.js";
import { User } from "../models/user.model.js";
import ErrorHandler from "../middlewares/error.js";
import { asyncHandler } from "../middlewares/aysncHandler.js";
import mongoose from "mongoose";

// Create Trade
export const createTrade = asyncHandler(async (req, res, next) => {
    const seller = req.user._id; // Automatically get the seller (logged-in user)
    
    const { buyer, stationId, items } = req.body;

    // Validate request
    if (!buyer || !stationId || !items || !Array.isArray(items) || items.length === 0) {
        return next(new ErrorHandler("Buyer, stationId, and at least one item are required", 400));
    }

    // Check if buyer exists
    const buyerUser = await User.findById(buyer);
    if (!buyerUser) {
        return next(new ErrorHandler("Buyer not found", 404));
    }

    // Check if there is already an active trade for the same buyerId and itemId
    for (const item of items) {
        const existingTrade = await Trade.findOne({
            buyer: buyer,
            seller: seller,
            "items.itemId": item.itemId,
            status: { $in: ['Initiated', 'In Progress'] }
        });

        if (existingTrade) {
            return next(new ErrorHandler(`A trade is already active for this specific itemId (${item.itemId}) on the name of this sellerId. Fulfill that firstly.`, 400));
        }
    }

    // Fetch the seller's inventory using the specified stationId
    const sellerInventory = await Inventory.findOne({ userId: seller, stationId: stationId });

    if (!sellerInventory) {
        return next(new ErrorHandler("Seller's inventory not found", 404));
    }

    let totalPrice = 0;

    // Check if seller has enough items in inventory and calculate the total price
    for (const item of items) {
        const inventoryItem = sellerInventory.items.find(invItem => invItem.itemId.toString() === item.itemId);

        if (!inventoryItem) {
            return next(new ErrorHandler(`Item with ID ${item.itemId} not found in inventory`, 400));
        }

        if (inventoryItem.quantity < item.quantity) {
            return next(new ErrorHandler(`Not enough quantity of item: ${inventoryItem.name}. Available: ${inventoryItem.quantity}, Requested: ${item.quantity}`, 400));
        }

        // Calculate the price for the item and add to totalPrice
        item.price = inventoryItem.price; // Fetch the price from the inventory
        item.totalPrice = item.quantity * item.price; // Calculate total price for the item
        totalPrice += item.totalPrice; // Add to total trade price
    }

    // Deduct items from seller's inventory in real-time
    items.forEach(item => {
        const inventoryItemIndex = sellerInventory.items.findIndex(invItem => invItem.itemId.toString() === item.itemId);
        if (inventoryItemIndex !== -1) {
            sellerInventory.items[inventoryItemIndex].quantity -= item.quantity;
            // If quantity reaches zero, you may want to remove the item completely from the inventory
            if (sellerInventory.items[inventoryItemIndex].quantity === 0) {
                sellerInventory.items.splice(inventoryItemIndex, 1);
            }
        }
    });

    // Save the updated inventory
    await sellerInventory.save();

    // Generate a unique transaction ID
    const transactionId = new mongoose.Types.ObjectId().toString();

    // Create the trade
    const trade = await Trade.create({
        transactionId,
        buyer,
        seller: seller, // Store seller ID as ObjectId
        items: items.map(item => ({
            itemId: item.itemId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice
        })),
        totalPrice // Store the total price of the trade
    });

    res.status(201).json({
        success: true,
        message: "Trade transaction created successfully",
        trade
    });
});


// Update Trade Status
export const updateTradeStatus = asyncHandler(async (req, res, next) => {
    const { transactionId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Initiated', 'In Progress', 'Completed', 'Failed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
        return next(new ErrorHandler("Invalid Trade Status!", 400));
    }

    let trade = await Trade.findOne({ transactionId });

    if (!trade) {
        return next(new ErrorHandler("Trade not found", 400));
    }

    if (status === 'Cancelled' && trade.status !== 'Cancelled') {
        const sellerInventory = await Inventory.findOne({ userId: trade.seller });

        if (!sellerInventory) {
            return next(new ErrorHandler("Seller's inventory not found", 404));
        }

        trade.items.forEach(item => {
            const inventoryItemIndex = sellerInventory.items.findIndex(invItem => invItem.itemId.toString() === item.itemId.toString());

            if (inventoryItemIndex !== -1) {
                sellerInventory.items[inventoryItemIndex].quantity += item.quantity;
            } else {
                sellerInventory.items.push({
                    itemId: item.itemId, 
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    status: 'Created'
                });
            }
        });

        await sellerInventory.save();
    }

    trade.status = status;
    await trade.save();

    res.status(200).json({ success: true, message: 'Trade status updated', trade });
});

// Get Trade by Transaction ID
export const getTrade = asyncHandler(async (req, res, next) => {
    const { transactionId } = req.query;

    if (!transactionId) {
        return next(new ErrorHandler("Transaction ID is required", 400));
    }

    let trade = await Trade.findOne({ transactionId });

    if (!trade) {
        return next(new ErrorHandler("Trade not found", 400));
    }
    
    res.status(200).json({ 
        success: true, 
        message: 'Trade fetched successfully', 
        trade 
    });
});
