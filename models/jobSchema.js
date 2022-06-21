import mongoose from 'mongoose'
import geocoder from '../utils/geocoder.js';


const jobSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
        required:true,
        trim:true,
    },
    category:{
        type:String,
        required:true,
        trim:true,
    },
    price:{
        type:Number,
        required:true,
        trim:true,
    },
    address:{
        type:String,
        required:true,
        trim:true,
    },
    taskLength:{
        type:String,
        required:true,
        trim:true,
    },
    endTime:{
        type:String,
        required:true,
        trim:true,
    },
    whatTime:{
        type:String,
        required:true,
        trim:true,
    },
    taskType:{
        type:String,
        required:true,
        trim:true,
    },
    postedBy:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:"User"
    },
    location: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: {
          type: [Number],
          index: "2dsphere"
        },
        formattedAddress: String
      },
      createAt:{
        type:Date,
        default:Date.now
      },
})

//Mongoose Middleware
jobSchema.pre("save", async function (next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type:"Point",
        coordinates:[loc[0].longitude, loc[0].latitude],
        formattedAddress:loc[0].formattedAddress
    }
    this.address = undefined;
    next();
})

export default mongoose.model("Job", jobSchema);