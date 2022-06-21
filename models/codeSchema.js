//Import all lib
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const resetCodeSchema = new mongoose.Schema({
  resetCode: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: { type: Date, default: Date.now, index: { expires: 5000 } },
});

//When user click forgot or resetpassword hashing resetCode
resetCodeSchema.pre("save", async function (next) {
  this.resetCode = await bcrypt.hash(this.resetCode, 12);
  next();
});

// when user pit requested new password verify the token
resetCodeSchema.methods.comparetoken = async function (plainCode, bcryptCode) {
  return await bcrypt.compare(plainCode, bcryptCode);
};

export default mongoose.model("Code", resetCodeSchema);
