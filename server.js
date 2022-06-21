import mongoose from "mongoose";
import app from './app.js'

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Connected to ${process.env.MONGO_URI}`)
  });



app.listen(process.env.PORT, () =>{
    console.log(`Connected to ${process.env.PORT}`)
})