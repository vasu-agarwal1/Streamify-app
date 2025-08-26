import mongoose,{Schema} from "mongoose";

const commentSchema = new Schema({},{timestamps: true})

export const comment = mongoose.model("comment", commentSchema)