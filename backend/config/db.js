import { connect } from 'mongoose';

const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI);
    const conn = await connect("mongodb+srv://prajwal:prajwal123@cluster0.tdu0l1a.mongodb.net/?appName=Cluster0");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
