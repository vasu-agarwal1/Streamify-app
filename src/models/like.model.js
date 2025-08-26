import mongoose,{Schema} from "mongoose";

const likeSchema = new Schema({},{timestamps: true})

export const like = mongoose.model("like", likeSchema)