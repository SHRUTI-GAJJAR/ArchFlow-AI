const mongoose = require("mongoose");

const actionItemSchema = new mongoose.Schema(
  {
    task: {
      type: String,
      required: true,
      trim: true,
    },

    assignee: {
      type: String,
      trim: true,
      default: "",
    },

    deadline: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { _id: false }
);

const deadlineSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const aiInsightSchema = new mongoose.Schema(
  {
    communication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Communication",
      required: true,
      unique: true,
    },

    summary: {
      type: String,
      default: "",
      trim: true,
    },

    decisions: [
      {
        type: String,
        trim: true,
      },
    ],

    actionItems: [actionItemSchema],

    deadlines: [deadlineSchema],

    peopleInvolved: [
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

const AIInsight = mongoose.model("AIInsight", aiInsightSchema);

module.exports = AIInsight;