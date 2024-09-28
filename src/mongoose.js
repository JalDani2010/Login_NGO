const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const mongoose = require('mongoose');

const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
  console.error('MONGO_URL is not defined in the environment variables');
  process.exit(1);
}

mongoose.connect(mongoUrl, {  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Connection to MongoDB failed:', err.message);
  });

const ngoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide NGO name"],
    maxlength: 100,
    minlength: 3,
  },
  contactPerson: {
    type: String,
    required: [true, "Please provide contact person's name"],
    maxlength: 50,
    minlength: 3,
  },
  mobileNumber: {
    type: String,
    required: [true, "Please provide mobile number"],
    match: [
      /^[0-9]{10}$/,
      "Please provide a valid 10-digit mobile number"
    ]
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
    unique: true,
  },
  updated12A: {
    type: Boolean,
    default: false,
  },
  updated80G: {
    type: Boolean,
    default: false,
  },
  address: {
    type: String,
    required: [true, "Please provide address"],
    maxlength: 500,
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
});

ngoSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

ngoSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.name },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

ngoSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

const NGO = new mongoose.model("NGO", ngoSchema);

module.exports = NGO;
