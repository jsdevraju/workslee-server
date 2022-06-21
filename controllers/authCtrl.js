import User from "../models/userSchema.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validateEmail } from "../utils/emailValidation.js";
import { nanoid } from "nanoid";
import sgMail from "@sendgrid/mail";

//Register
export const register = catchAsyncError(async (req, res, next) => {
  const { username, fullname, email, password } = req.body;

  const newUserName = username?.toLowerCase().replace(/ /g, "");
  const newFullName = fullname?.charAt(0).toUpperCase() + fullname.slice(1);

  //  Generate email verification code
  const emailVerifyCode = nanoid(6).toUpperCase();

  //Send Verification Email
  sgMail.setApiKey(process.env.SENDGRID_SECRET);

  //Create Email Message Template
  const msg = {
    to: email,
    from: process.env.GMAIL_ID,
    subject: "Verify Your Account",
    text: "Do not share your verify code with anyone.",
    html: `
    <h1>Hello Mr ${fullname}👏</h1>
    <h1> Do not share your password verify code with anyone.</h1>
          <br>
          <center> <strong>${emailVerifyCode}</strong> </center/>
          `,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log(`Verify Email Message Sent Success`);
    })
    .catch((err) => {
      console.log(`Verify Email Message Sent Failure: ${err}`);
    });

  // Server Side Validation
  if (newUserName?.length < 3 || newUserName?.length > 15)
    return next(
      new ErrorHandler("Username must be between 3 and 15 characters", 400)
    );
  if (fullname?.length < 5 || fullname?.length > 30)
    return next(
      new ErrorHandler("Fullname must be between 5 and 30 characters", 400)
    );
  if (password?.length < 8 || password?.length > 32)
    return next(
      new ErrorHandler("Password must be between 8 and 30 characters", 400)
    );
  if (!validateEmail(email))
    return next(new ErrorHandler("Invalid email", 400));

  // hashing password
  const hashPassword = await bcrypt.hash(password, 12);

  const user = new User({
    username: newUserName,
    fullname: newFullName,
    email,
    password: hashPassword,
  });

  user.verifyCode = emailVerifyCode;

  await user.save();

  //Generate a user token
  const token = generateToken(user?._id);

  const {
    password: myPassword,
    verifyCode: myVerifyCode,
    ...userInfo
  } = user._doc;

  res
    .cookie("token", token, {
      httpOnly: true,
    })
    .status(201)
    .json({
      message: "Register Successfully",
      userInfo,
      token,
    });
});

//Verify User Account
export const verifyUserAccount = catchAsyncError(async (req, res, next) => {
  const { email, verifyCode } = req.body;

  //Find User Account
  let code = await User.findOne({ email });
  if (!code) return next(new ErrorHandler("Invalid email address"));

  if (code.isEmailVerified)
    return next(new ErrorHandler("You already verify Email"));
  else if (!verifyCode)
    return next(new ErrorHandler("Invalid emailVerifyCode", 400));
  else if (verifyCode !== code.verifyCode)
    return next(new ErrorHandler("Please enter a valid code", 400));
  else if (verifyCode === code.verifyCode) {
    code.set({ isEmailVerified: true });

    await code.save();

    // Genetate a token
    const token = generateToken(code._id);

    const { password, verifyCode: myVerifyCode, ...userInfo } = code._doc;

    res
      .cookie("token", token, {
        httpOnly: true,
      })
      .status(201)
      .json({
        message: "User Account Verify successfully",
        userInfo,
        token,
      });
  }
});

// Login
export const login = catchAsyncError(async(req, res, next) =>{
    const { email, password} =  req.body;

    const user  = await User.findOne({ email});
    if(!user) await next(new ErrorHandler("Invalid credentials", 400));

    const isPasswordVerified = await bcrypt.compare(password, user.password);
    if(!isPasswordVerified) return next(new ErrorHandler("Invalid credentials", 400));

    const { password:myPassword, verifyCode, ...userInfo} = user._doc;
    // Generate token
    const token = generateToken(user?._id);

    res
    .cookie("token", token, {
      httpOnly: true,
    })
    .status(200)
    .json({
      message: "Login Successfully",
      token: token,
      userInfo,
    });

})

// Logout
export const logout = catchAsyncError(async (req, res, next) => {
    res
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .status(200)
    .json({
      message: "Logged Our Successfully",
      token: null,
      userInfo: null,
    });
})


function generateToken(payload) {
  const token = jwt.sign({ id: payload }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return token;
}
