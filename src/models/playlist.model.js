import mongoose,{Schema} from "mongoose";

const playlistSchema = new Schema({},{timestamps: true})

export const playlist = mongoose.model("playlist", playlistSchema)