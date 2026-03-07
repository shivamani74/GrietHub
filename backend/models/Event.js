import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    venue: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    registrationDeadline: {
      type: Date,
      required: true,
    },
    images: [
  {
    type: String, 
  },
],
status: {
  type: String,
  enum: ["active", "archived"],
  default: "active",
},


    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
