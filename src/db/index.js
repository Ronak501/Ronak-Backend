import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
     try {
          const connectionInstance = await mongoose.connect(`${process.env.MONGODS_URL}/${DB_NAME}`);
          console.log(`\nMONGODB connection success${connectionInstance.connection.host}`);
     } catch (error) {
          console.log("MONGOOSE connection error",error);
          process.exit(1)
     }
}

export default connectDB;