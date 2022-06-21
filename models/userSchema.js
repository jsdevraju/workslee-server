import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        minlength:[3, 'usernname at least 5 characters'],
        maxlength:[15, 'username no longer exceeds 15 characters'],
        unique:true,
        trim:true
    },
    fullname:{
        type:String,
        required:true,
        minlength:[5, 'Full Name at least 5 characters'],
        maxlength:[30, 'Full Name no longer exceeds 30 characters'],
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:[8, 'Password must be at least 8 characters'],
        trim:true,
    },
    phoneNo:{
        type:Number,
        trim:true,
        default:""
    },
    verifyCode:{
        type:String,
        default:""
    },
    isEmailVerified:{
        type:Boolean,
        trim:true,
        default:false
    },
    idVerify:{
        type:Boolean,
        trim:true,
        default:false
    },
    faceVerify:{
        type:Boolean,
        trim:true,
        default:false
    },
    skills:[
        {
            type:String,
            required:true,
            default:"Your Default Skill"
        }
    ],
    numOfReviews:{
      type:Number,
      default:0,
      trim:true,
    },
    ratings:{
      type:Number,
      default:0,
      trim:true,
    },
    reviews: [
        {
          user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
          },
          name:{
            type: String,
            required: true,
          },
          rating: {
            type: Number,
            required: true,
          },
          comment: {
            type: String,
            required: true,
          },
        },
      ],
      role:{
        type:String,
        default:"user",
        enum:["client", "worker", "admin", "user"]
      },
      avatar:{
        type:String,
        default:"https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
      },
      createAt:{
        type:Date,
        default:Date.now
      }
})


export default mongoose.model("User", userSchema);