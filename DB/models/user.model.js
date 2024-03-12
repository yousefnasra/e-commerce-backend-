import { Schema, model } from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        min: 3,
        max: 20,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 20,
    },
    isConfirmed: { type: Boolean, default: false },
    gender: { type: String, enum: ["male", "female"] },
    phone: { type: String },
    role: {
        type: String,
        enum: ["user", "seller", "admin"],
        default: "user"
    },
    forgetCode: { type: String, length: 6 },
    profileImage: {
        url: { type: String, default: "https://res.cloudinary.com/dzxfqohg5/image/upload/v1706157248/ecommerce/users/defaults/Default-Profile-Picture-PNG-Download-Image_y89bi8.png" },
        id: { type: String, default: "ecommerce/users/defaults/Default-Profile-Picture-PNG-Download-Image_y89bi8.png" }
    },
    coverImages: [{ url: { type: String }, id: { type: String } }],
},
    { timestamps: true }
);

// hash password hook
userSchema.pre("save", function () {
    if (this.isModified("password")) {
        this.password = bcryptjs.hashSync(this.password, parseInt(process.env.SALT_ROUND));
    }
});


export const User = model("User", userSchema);