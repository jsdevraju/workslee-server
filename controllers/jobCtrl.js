import Job from "../models/jobSchema.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";

//Create a new Job
export const createJob = catchAsyncError(async (req, res, next) => {
  const {
    title,
    description,
    category,
    price,
    address,
    taskLength,
    endTime,
    whatTime,
    taskType,
  } = req.body;

  if (title?.length < 10 || title?.length > 30)
    return next(new ErrorHandler("Title must be at least 10 characters", 400));

  if (description?.length < 10 || description?.length > 500)
    return next(
      new ErrorHandler("Description must be at least 10 or longer 400 characters", 400)
    );

  if (category?.length < 2 || category?.length > 20)
    return next(
      new ErrorHandler("Category must be at least 10 characters", 400)
    );

  if (address?.length < 3)
    return next(new ErrorHandler("Address must be at least 3 characters", 400));

  if (price?.length < 2)
    return next(new ErrorHandler("Price must be at least 2 characters", 400));

  const job = new Job({
    title,
    description,
    category,
    address,
    price,
    postedBy: req.user?._id,
    taskLength,
    endTime,
    whatTime,
    taskType,
  });

  await job.save();

  res.status(200).json({
    message: "Post Job Successfully",
    job,
  });
});

// Get All Job Post
export const getAllJobPost = catchAsyncError(async (req, res, next) => {
  const job = await Job.find({}).populate("postedBy", "username fullname");

  res.status(200).json({
    message: "Successfully",
    job,
  });
});

// Get Single Post
export const getSingleJobPost = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const job = await Job.findById(id).populate(
    "postedBy",
    "username fullname isEmailVerified idVerify faceVerify createAt ratings numOfReviews"
  );

  if (!job) return next(new ErrorHandler("Bad Requested", 400));

  res.status(200).json({
    message: "Successfully",
    job,
  });
});

// Update Job Post
export const updateJobPost = catchAsyncError(async (req, res, next) => {
  const {
    title,
    description,
    category,
    price,
    address,
    taskLength,
    endTime,
    whatTime,
    taskType,
  } = req.body;

  if (title?.length < 10 || title?.length > 30)
    return next(new ErrorHandler("Title must be at least 10 characters", 400));

  if (description?.length < 10 || description?.length > 30)
    return next(
      new ErrorHandler("Description must be at least 10 characters", 400)
    );

  if (category?.length < 2 || category?.length > 20)
    return next(
      new ErrorHandler("Category must be at least 10 characters", 400)
    );

  if (address?.length < 3)
    return next(new ErrorHandler("Address must be at least 3 characters", 400));

  if (price?.length < 2)
    return next(new ErrorHandler("Price must be at least 2 characters", 400));

  if (description) req.body.description = description;
  if (category) req.body.category = category;
  if (price) req.body.price = price;
  if (address) req.body.address = address;
  if (taskLength) req.body.taskLength = taskLength;
  if (endTime) req.body.endTime = endTime;
  if (whatTime) req.body.whatTime = whatTime;
  if (taskType) req.body.taskType = taskType;

  const postJob = await Job.findById(req.params.id);
  const authorPost = await Job.findOne({ postedBy: req.user.id });
  // if he try to update another person blog return this error
  if (!authorPost)
    return next(new ErrorHandler("Your are not author this post", 404));
  if (!postJob) return next(new ErrorHandler("Bad Requested", 400));

  const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    useFindAndModify: true,
  });

  res.status(200).json({
    message: "Update Post Successfully",
    job,
  });
});

//Delete Job Post
export const deleteJobPost = catchAsyncError(async (req, res, next) => {
  const postJob = await Job.findById(req.params.id);
  const authorPost = await Job.findOne({ postedBy: req.user.id });
  // if he try to update another person blog return this error
  if (!authorPost)
    return next(new ErrorHandler("Your are not author this post", 404));
  if (!postJob) return next(new ErrorHandler("Bad Requested", 400));

  const job = await Job.findById(req.params.id);

  await job.remove();

  res.status(200).json({
    message: "Delete Post Successfully",
  });
});
