import mongoose from "mongoose";

const cargoSchema = new mongoose.Schema({
    shipmentId: {
        type: String,
        required: true,
        unique: true
    },
    origin: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    items: [
        {
            itemId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            name: String,
            quantity: Number,
            price: Number,
            totalPrice: Number
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Transit', 'Delivered', 'Delayed', 'Cancelled'],
        default: 'Pending'
    },
    departureDate: {
        type: Date,
        default: Date.now
    },
    arrivalDate: {
        type: Date
    }
});

cargoSchema.pre('save', function (next) {
    if (this.departureDate && !this.arrivalDate) {
        let arrival = new Date(this.departureDate);
        arrival.setDate(arrival.getDate() + 7);
        this.arrivalDate = arrival;
    }
    next();
});

export const Cargo = mongoose.model("Cargo", cargoSchema);
