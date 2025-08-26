import mongoose,{Schema} from "mongoose";

const tweetSchema = new Schema({},{timestamps: true})

export const tweet = mongoose.model("tweet", tweetSchema)