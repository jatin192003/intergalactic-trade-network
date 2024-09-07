import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
        // unique: true  // Ensure this is NOT set to unique
    },
    stationId: {
        type: String,
        required: true,
        unique: true // stationId should remain unique
    },
    name: {
        type: String,
        required: true
    },
    items: [
        {
            itemId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                default: () => new mongoose.Types.ObjectId(),
                unique: true
            },
            name: String,
            price: Number,
            quantity: Number,
            status: {
                type: String,
                enum: ['Created', 'Trade', 'Transported'],
                default: 'Created'
            }
        }
    ],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

inventorySchema.pre('save', function (next) {
    if (this.isModified('items')) {
        this.lastUpdated = Date.now();
    }
    next();
});

export const Inventory = mongoose.model("Inventory", inventorySchema);
