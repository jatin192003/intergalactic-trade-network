import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [
        {
            itemId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            name: String,
            quantity: Number,
            price: Number, // Add price to store the price at the time of the trade
            totalPrice: Number // Add totalPrice to store quantity * price
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Initiated', 'In Progress', 'Completed', 'Failed', 'Cancelled'],
        default: 'Initiated',
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Trade = mongoose.model("Trade", tradeSchema);
