import catchAsyncError from "../middleware/catchAsyncError.js";
import User from "../models/userSchema.js";
import { validateEmail } from "../utils/emailValidation.js";
import ErrorHandler from "../utils/errorHandler.js";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import Code from "../models/codeSchema.js";
import sgMail from "@sendgrid/mail";

//Update User profile
export const updateUserProfile = catchAsyncError(async (req, res, next) => {
  const { _id } = req.user;
  const { username, fullname, email } = req.body;

  const newUserName = username?.toLowerCase()?.replace(/ /g, "");
  const newFullName = fullname?.charAt(0)?.toUpperCase() + fullname?.slice(1);

  // Server Side Validation
  if (newUserName?.length < 3 || newUserName?.length > 15)
    return next(
      new ErrorHandler("Username must be between 3 and 15 characters", 400)
    );
  if (newFullName?.length < 5 || newFullName?.length > 30)
    return next(
      new ErrorHandler("Fullname must be between 5 and 30 characters", 400)
    );

  if (email && !validateEmail(email))
    return next(new ErrorHandler("Invalid email", 400));

  if (username) req.body.username = newUserName;
  if (fullname) req.body.fullname = newFullName;
  if (email) req.body.email = email;

  const user = await User.findByIdAndUpdate(_id, req.body, {
    new: true,
    useFindAndModify: true,
  });

  if (!user) return next(new ErrorHandler("Bad Request", 400));

  const { password, verifyCode, ...userInfo } = user._doc;

  res.status(200).json({
    message: "Updated user profile successfully",
    userInfo,
  });
});

// Update Password
export const updatePassword = catchAsyncError(async (req, res, next) => {
  const { _id } = req.user;
  const user = await User.findByIdAndUpdate(_id);
  const { oldPassword, newPassword } = req.body;

  const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordMatch) return next(new ErrorHandler("Invalid Password"));

  if (oldPassword === newPassword)
    return next(
      new ErrorHandler("It's your oldPassword ! try to enter new", 400)
    );

  if (newPassword?.length < 8 || newPassword?.length > 32)
    return next(
      new ErrorHandler("Password must be between 8 and 32 characters", 400)
    );

  const hashPassword = await bcrypt.hash(newPassword, 12);

  user.password = hashPassword;

  await user.save();

  res.status(200).json({
    message: "Password Update successfully",
  });
});

// Send Reset Code in email
export const sendResetCode = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  // Generate a random code
  const resetCode = nanoid(6).toUpperCase();

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("Credentials does not exist", 400));
  else {
    //send email
    sgMail.setApiKey(process.env.SENDGRID_SECRET);
    const msg = {
      to: email, // Change to your recipient
      from: process.env.GMAIL_ID, // Change to your verified sender
      subject: "Password reset code",
      text: "Do not share your password reset code with anyone.",
      html: `
      <h1>Hello Mr ${user?.fullname}👏</h1>
      <h1> Do not share your password reset code with anyone.</h1>
          <br>
          <center> <strong>${resetCode}</strong> </center/>
          `,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });

    const existingCode = await Code.findOne({ email }).select(
      "-__v -createdAt -updatedAt"
    );
    if (existingCode) {
      await Code.deleteOne({ email });
      const saveCode = new Code({ resetCode, email });
      await saveCode.save();
    } else {
        const saveCode = new Code({ resetCode, email });
        await saveCode.save();
    }

    res.status(200).json({
      message:
        "Email sent successfully ! Please check your email and verifyCode",
    });
  }
});

// After sent email now verifyCode
export const verifyCode = catchAsyncError(async (req, res, next) => {
  const { email, resetCode } = req.body;

  const code = await Code.findOne({ email });
  if (code === null) return next(new ErrorHandler("Invalid email or resetCode", 400));

  if (!code && code?.length === 0)
    return next(
      new ErrorHandler("Invalid or expired reset code, Please try again", 400)
    );
  else if (await code.comparetoken(resetCode, code.resetCode)) {
    code.isVerified = true;
    await code.save();
    res.status(200).json({
      message: "Change Password now",
    });
  } else return next(new ErrorHandler("Invalid or expired reset code", 400));
});

//After Verify Email && Password reset code now change password
export const changePassword = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const verifyCode = await Code.findOne({ email });

  if (password?.length < 8 || password?.length > 32)
    return next(
      new ErrorHandler(
        "Password must be at least 8 characters or upto 32 characters",
        400
      )
    );

  if (!verifyCode || !verifyCode.isVerified) {
    return next(
      new ErrorHandler("Invalid or expired reset code, Please try again.", 400)
    );
  } else {
    const updatePass = await User.findOne({ email });

    const hashingPassword = await bcrypt.hash(password, 12);

    updatePass.password = hashingPassword;

    await updatePass.save();

    await Code.deleteOne({ id: verifyCode._id });
    res.json({
      message: "Password Change Success. Please return and login again",
    });
  }
});

// Get User Info
export const getUserInfo = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const { password, verifyCode, ...userInfo } = user._doc;

  res.status(200).json({
    message: "Successfully",
    userInfo,
  });
});

// Create a Review 
export const createReview = catchAsyncError(async(req, res, next) =>{
    const { comment, rating } = req.body;
    const { _id, username } = req.user;

    const review = {
      user: _id,
      name:username,
      rating:Number(rating),
      comment
    } 
    
    const job = await User.findById(_id);

    const isReviewed = job.reviews.find(
      (review) => review.user.toString() === _id?.toString()
    );
  
    if (isReviewed) {
      job.reviews.forEach((review) => {
        if (review.user.toString() === _id?.toString()) review.rating = rating;
        review.comment = comment;
      });
    } else {
      job.reviews.push(review);
      job.numOfReviews = job.reviews.length;
    }
  
    let avg = 0;
    job.reviews.forEach((review) => {
      avg += review.rating;
    });
  
    job.ratings = avg / job.reviews.length;
  
    await job.save({ validateBeforeSave: false });
  
    res.status(200).json({
      message: "Create Or Update Review",
    });

})