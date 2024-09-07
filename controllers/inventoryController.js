import mongoose from "mongoose";
import { Inventory } from "../models/inventory.model.js";
import ErrorHandler from "../middlewares/error.js";
import { asyncHandler } from "../middlewares/aysncHandler.js";


export const createInventory = asyncHandler(async (req, res, next) => {
    const { userId, name, items } = req.body;

    if (!userId || !name || !items || !Array.isArray(items) || items.length === 0) {
        return next(new ErrorHandler("User ID, inventory name, and at least one item are required", 400));
    }

    // Generate a unique stationId
    const stationId = new mongoose.Types.ObjectId().toString();

    const inventory = await Inventory.create({
        userId,
        stationId,
        name,
        items: items.map(item => ({
            itemId: new mongoose.Types.ObjectId(),
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            status: 'Created'
        }))
    });

    res.status(201).json({
        success: true,
        message: "Inventory created successfully",
        inventory
    });
});


export const getInventory = asyncHandler(async (req, res, next) => {
    const { userId, stationId } = req.params;

    let inventory = await Inventory.findOne({ userId, stationId });

    if (!inventory) {
        return next(new ErrorHandler("Inventory not found", 400));
    }

    res.status(200).json({
        success: true,
        message: 'Inventory fetched successfully',
        inventory
    });
});

export const getUserInventories = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;

    // Fetch all inventories for the specified user
    const inventories = await Inventory.find({ userId });

    if (!inventories || inventories.length === 0) {
        return next(new ErrorHandler("No inventories found for this user", 404));
    }

    res.status(200).json({
        success: true,
        message: 'Inventories fetched successfully',
        inventories
    });
});

export const addItemsToInventory = asyncHandler(async (req, res, next) => {
    const { stationId } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return next(new ErrorHandler("At least one item is required", 400));
    }

    // Fetch the existing inventory by stationId
    const inventory = await Inventory.findOne({ stationId });

    if (!inventory) {
        return next(new ErrorHandler("Inventory not found", 404));
    }

    // Update the items array only
    items.forEach(newItem => {
        const existingItemIndex = inventory.items.findIndex(item => item.itemId.toString() === newItem.itemId);

        if (existingItemIndex !== -1) {
            // Update the existing item's details
            if (newItem.name) inventory.items[existingItemIndex].name = newItem.name;
            if (newItem.price) inventory.items[existingItemIndex].price = newItem.price;
            if (newItem.quantity) inventory.items[existingItemIndex].quantity += newItem.quantity;
            if (newItem.status) inventory.items[existingItemIndex].status = newItem.status;
        } else {
            // Add the new item
            inventory.items.push({
                itemId: new mongoose.Types.ObjectId(),
                name: newItem.name,
                price: newItem.price,
                quantity: newItem.quantity,
                status: newItem.status || 'Created'
            });
        }
    });

    // Save only the updated items array within the inventory document
    await inventory.save({ validateModifiedOnly: true });

    res.status(200).json({
        success: true,
        message: 'Items added/updated successfully',
        inventory
    });
});


export const updateItemsInInventory = asyncHandler(async (req, res, next) => {
    const { stationId, itemId } = req.params;
    const { name, price, quantity, status } = req.body;

    if (!name && !price && !quantity && !status) {
        return next(new ErrorHandler("At least one field (name, price, quantity, or status) is required to update the item", 400));
    }

    // Find the inventory by stationId
    const inventory = await Inventory.findOne({ stationId });

    if (!inventory) {
        return next(new ErrorHandler("Inventory not found", 404));
    }

    // Find the item within the inventory by itemId
    const item = inventory.items.find(item => item.itemId.toString() === itemId);

    if (!item) {
        return next(new ErrorHandler("Item not found in the inventory", 404));
    }

    // Update the item's details
    if (name) item.name = name;
    if (price) item.price = price;
    if (quantity) item.quantity = quantity;
    if (status) item.status = status;

    // Save the updated inventory
    await inventory.save();

    res.status(200).json({
        success: true,
        message: 'Item updated successfully',
        inventory
    });
});



export const deleteInventory = asyncHandler(async (req, res, next) => {
    const { userId, stationId } = req.params;

    // Find and delete the inventory by userId and stationId
    const inventory = await Inventory.findOneAndDelete({ userId, stationId });

    if (!inventory) {
        return next(new ErrorHandler("Inventory not found", 404));
    }

    res.status(200).json({
        success: true,
        message: 'Inventory deleted successfully',
    });
});

export const deleteItemFromInventory = asyncHandler(async (req, res, next) => {
    const { stationId, itemId } = req.params;

    const inventory = await Inventory.findOne({ stationId });

    if (!inventory) {
        return next(new ErrorHandler("Inventory not found", 404));
    }

    const itemIndex = inventory.items.findIndex(item => item.itemId.toString() === itemId);

    if (itemIndex === -1) {
        return next(new ErrorHandler("Item not found in the inventory", 404));
    }

    inventory.items.splice(itemIndex, 1);

    await inventory.save();

    res.status(200).json({
        success: true,
        message: 'Item deleted successfully from inventory',
        inventory
    });
});

