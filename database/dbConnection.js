import mongoose from "mongoose"

const dbConnection = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}`)
        console.log(`\n MonogoDB Connected`);
    } catch (error) {
        console.log("MongoDb Connection Failed", error);
        process.exit(1)
    }
}

export default dbConnection;