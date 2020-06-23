const { log, log_err, log_warn } = require("../../utils/logs")
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const task = require("./task");
const Task = require("./task");

const schema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, "no name provided"],
      trim: true
   },
   email: {
      type: String,
      unique: true,
      required: true,
      validate(value) {
         if (!validator.isEmail(value)) {
            throw new Error("email address is not correct")
         }
      },
      lowercase: true
   },
   age: {
      type: Number,
      default: 0
   },
   password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(value) {
         if (validator.contains(value, "password", { ignoreCase: true })) {
            throw new Error("password could not contain 'password' word")
         }
      }
   },
   tokens: [{
      token: {
         type: String,
         require: true
      }
   }],
   avatar: {
      type: Buffer
   },
},
   {
      timestamps: true
   })


schema.virtual('tasks', {
   ref: 'Task', // The model to use
   localField: '_id', // Find people where `localField`
   foreignField: 'owner'//, // is equal to `foreignField`
   // count: true // And only get the number of docs
});

schema.methods.toJSON = function () {
   const user = this

   const object = user.toObject()
   delete object.tokens
   delete object.password
   delete object.avatar
   return object
}

schema.methods.generateAuthToken = async function () {
   const user = this
   const token = await jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
   user.tokens = user.tokens.concat({ token })
   await user.save()

   return token
}

schema.statics.findByCredentials = async (email, password) => {
   const user = await User.findOne({ email })

   if (!user) {
      throw new Error("Unable to login")
   }

   const isMatch = await bcrypt.compare(password, user.password)
   log("bcrypt.compare", isMatch)
   if (!isMatch) {
      throw new Error("Unable to login")
   }
   return user
}

//hash the plain text before saving
schema.pre("save", async function (next) {
   const user = this

   if (user.isModified("password")) {
      user.password = await bcrypt.hash(user.password, 8)
   }
   next()
})

//Delete user tasks when user is removed

schema.pre("remove", async function (next) {

   const user = this

   log("remove", user._id)
   await Task.deleteMany({ owner: user._id })

   next()
})

const User = mongoose.model("User", schema)

module.exports = User