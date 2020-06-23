const { log, log_err, log_warn } = require("../../utils/logs")
const User = require("../models/user")
const auth = require("../middleware/auth")
const express = require("express")
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp');
const {sendWelcomeEmail, sendGoodBuyEmail} = require ("../emails/account")

const upload = multer({
   limits:{
      fileSize : 1200000
   },
   fileFilter: function (req, file, cb) {

      if (!file.originalname.match('.(jpg|jpeg|png)$')) {
         return cb(new Error('Please, upload an images'))
      }
      cb(null, true)
   }
})


router.post("/users/me/avatar", auth, upload.single('avatar'), async (req, res) => {

   req.user.avatar = await sharp(req.file.buffer).resize({width:250, height:250})
    .png()
    .toBuffer();


   await req.user.save()
   res.send(req.user)
}, (error, req, res, next) => {
   log_err(error)
   res.status(400).send({ error: error.message })
})

router.delete("/users/me/avatar", auth, upload.single('avatar'), async (req, res) => {

   req.user.avatar = null
   await req.user.save()
   res.send(req.user)
})

router.get("/users/:id/avatar", async (req, res)=>{
   try{
      const user = await  User.findById(req.params.id)

      if(!user || !user.avatar){
         throw new Error()
      }

      res.set("Content-Type", "image/jpg")
      res.send(user.avatar)

   }catch(err){
      res.status(404).send(err)
   }
})

router.get("/users/me", auth, async (req, res) => {

   res.send(req.user)
})

router.patch("/users/me", auth, async (req, res) => {

   const updates = Object.keys(req.body)
   const allowedUpdates = ["name", "email", "password", "age"]
   const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

   if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates!" })
   }

   try {
      const user = req.user

      updates.forEach((update) => {
         user[update] = req.body[update]
      })

      await user.save()

      res.status(200).send(user)
   } catch (err) {
      log_err(err)
      res.status(400).send(err)
   }
})

router.delete("/users/me", auth, async (req, res) => {

   try {
      //const user = await User.findByIdAndDelete(req.user._id)
      // //log(user)
      // if (!user) {
      //    //   console.log(user)
      //    return res.status(404).send()
      // }

      await req.user.remove()
      sendGoodBuyEmail(req.user.email, req.user.name)

      res.status(200).send(req.user)
   } catch (err) {
      log_err(err)
      res.status(400).send(err)
   }
})

router.post("/users", async (req, res) => {
   // log(req.body)

   const user = new User(req.body)
   try {
      //await user.save()
      const token = await user.generateAuthToken()
      sendWelcomeEmail(user.email, user.name)
      res.status(200).send({ user: user, token })
   } catch (err) {
      log_err(err)
      res.status(400).send(err)
   }
})

router.post("/users/login", async (req, res) => {
   try {
      const { email, password } = req.body
      const user = await User.findByCredentials(email, password)
      const token = await user.generateAuthToken()

      res.status(200).send({ user, token })
   } catch (err) {
      log_err(err)
      res.status(400).send({ err: err.message })
   }
})

router.post("/users/logout", auth, async (req, res) => {

   try {
      req.user.tokens = req.user.tokens.filter((token) => req.token !== token.token)
      await req.user.save()
      res.send()

   } catch (err) {
      res.status(500).send({ err: err.message })
   }
})


router.post("/users/logoutAll", auth, async (req, res) => {

   try {
      req.user.tokens = []
      await req.user.save()
      res.send()

   } catch (err) {
      res.status(500).send({ err: err.message })
   }
})



module.exports = router