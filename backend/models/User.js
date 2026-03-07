import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
   
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    rollNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

  
    role: {
      type: String,
      enum: ["student", "admin", "superadmin"],
      default: "student",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    adminVerification: {
      proofDocument: {
        type: String,
      },

      clubName: {
        type: String,
        trim: true,
      },

      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },

      submittedAt: {
        type: Date,
      },

      verifiedAt: {
        type: Date,
      },

      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
      },
    },

   
    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
);


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
