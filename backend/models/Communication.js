const mongoose = require("mongoose");

const communicationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    source: {
      type: String,
      enum: ["meeting", "email", "chat", "note"],
      default: "meeting",
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    participants: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Communication = mongoose.model(
  "Communication",
  communicationSchema
);

module.exports = Communication;