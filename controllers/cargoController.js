import { Cargo } from "../models/cargo.model.js";
import { Trade } from "../models/trade.model.js";
import ErrorHandler from "../middlewares/error.js";
import { asyncHandler } from "../middlewares/aysncHandler.js";

// Create Cargo
export const createCargo = asyncHandler(async (req, res, next) => {
    const { shipmentId, origin, destination, items } = req.body;

    if (!shipmentId || !origin || !destination || !items || !Array.isArray(items) || items.length === 0) {
        return next(new ErrorHandler("All fields are required and at least one item is required", 400));
    }

    const existingShipmentId = await Cargo.findOne({ shipmentId });
    if (existingShipmentId) {
        return next(new ErrorHandler("Shipment ID already exists!", 400));
    }

    let totalCargoPrice = 0;
    for (const item of items) {
        const trade = await Trade.findOne({ "items.itemId": item.itemId });

        if (!trade) {
            return next(new ErrorHandler(`No trade found for item with ID ${item.itemId}`, 404));
        }

        const tradeItem = trade.items.find(tradeItem => tradeItem.itemId.toString() === item.itemId);

        if (!tradeItem) {
            return next(new ErrorHandler(`Item with ID ${item.itemId} not found in trade`, 400));
        }

        if (tradeItem.quantity < item.quantity) {
            return next(new ErrorHandler(`Cargo Limit Exceeding (Invalid Request). Available: ${tradeItem.quantity}, Requested: ${item.quantity}`, 400));
        }

        item.price = tradeItem.price;
        item.totalPrice = item.quantity * item.price;
        totalCargoPrice += item.totalPrice;

        tradeItem.quantity -= item.quantity;

        if (tradeItem.quantity === 0) {
            trade.items = trade.items.filter(tradeItem => tradeItem.itemId.toString() !== item.itemId);
        }
        await trade.save();
    }

    // Change the trade status to "In Progress"
    const trade = await Trade.findOneAndUpdate(
        { "items.itemId": { $in: items.map(item => item.itemId) } },
        { $set: { status: 'In Progress' } },
        { new: true }
    );

    if (!trade) {
        return next(new ErrorHandler("Trade not found while updating status", 404));
    }

    const cargo = await Cargo.create({
        shipmentId,
        origin,
        destination,
        items,
        totalPrice: totalCargoPrice,
        status: 'Pending',
        departureDate: new Date(),
    });

    res.status(201).json({
        success: true,
        message: "Cargo created successfully, trade status updated to 'In Progress'",
        cargo,
        trade
    });
});

export const updateCargoQuantity = asyncHandler(async (req, res, next) => {
    const { shipmentId } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return next(new ErrorHandler("At least one item is required for updating cargo", 400));
    }

    try {
        let cargo = await Cargo.findOne({ shipmentId });

        if (!cargo) {
            return next(new ErrorHandler("Cargo not found", 400));
        }

        let totalCargoPrice = 0;

        for (const item of items) {
            const cargoItem = cargo.items.find(cItem => cItem.itemId.toString() === item.itemId);
            if (!cargoItem) {
                return next(new ErrorHandler(`Item with ID ${item.itemId} not found in cargo`, 404));
            }

            // Fetch the trade corresponding to the cargo item
            const trade = await Trade.findOne({ "items.itemId": item.itemId });

            if (!trade) {
                return next(new ErrorHandler(`No trade found for item with ID ${item.itemId}`, 404));
            }

            const tradeItem = trade.items.find(tItem => tItem.itemId.toString() === item.itemId);
            if (!tradeItem) {
                return next(new ErrorHandler(`Item with ID ${item.itemId} not found in trade`, 404));
            }

            // Check if the trade item quantity is 0 or less, meaning the order is already fulfilled
            if (tradeItem.quantity <= 0) {
                return next(new ErrorHandler(`Order already fulfilled for item with ID ${item.itemId}`, 400));
            }

            if (item.quantity > tradeItem.quantity) {
                return next(new ErrorHandler(`Not enough quantity of item: ${tradeItem.name}. Available: ${tradeItem.quantity}, Requested: ${item.quantity}`, 400));
            }

            // Add the new quantity to the existing cargo item quantity
            cargoItem.quantity += item.quantity;
            cargoItem.totalPrice += item.quantity * tradeItem.price; // Update total price for the cargo item
            totalCargoPrice += item.quantity * tradeItem.price; // Add to total cargo price

            // Deduct the added quantity from the trade item quantity
            tradeItem.quantity -= item.quantity;

            // If trade item quantity is zero, remove it from the trade
            if (tradeItem.quantity === 0) {
                trade.items = trade.items.filter(tItem => tItem.itemId.toString() !== item.itemId);
            }

            await trade.save();
        }

        // Update the total price of the cargo
        cargo.totalPrice += totalCargoPrice;
        await cargo.save();

        res.status(200).json({
            success: true,
            message: 'Cargo and trade updated successfully',
            cargo
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// Get Cargo by Shipment ID
export const getCargo = asyncHandler(async (req, res, next) => {
    const { shipmentId } = req.params;
    let cargo = await Cargo.findOne({ shipmentId });

    if (!cargo) {
        return next(new ErrorHandler("cargo not found", 400))
    }
    res.status(200).json({ success: true, message: 'cargo fetched successfully', cargo });
});
