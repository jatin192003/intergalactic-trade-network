import mongoose from "mongoose";

export const connection = ()=>{
    mongoose.connect(process.env.MONGODB_URI, {
        dbName: "INTERGALACTIC_TRADE_NETWORK"
    }).then(()=>{
        console.log("Connected to database.")
    }).catch(err=>{
        console.log(`Some error occured while connecting to database: ${err}`)
    })
}