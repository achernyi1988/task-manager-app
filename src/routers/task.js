const { log, log_err, log_warn } = require("../../utils/logs")
const Task = require("../models/task")
const auth = require("../middleware/auth")
const express = require("express")
const router = new express.Router()

//Get  /tasks?completed=true
//Get  /tasks?limit=10&skip=0
//Get  /tasks?sortBy=createdAt:asc
router.get("/tasks", auth, async (req, res) => {
   try{
      //const tasks = await Task.find({owner: req.user._id})

      const completed = req.query.completed
      const sortBy = req.query.sortBy

      const match = {}
      const sort = {}
      if(sortBy){
         const sortParams = sortBy.split(':')
         const field= sortParams[0]
         const order = sortParams[1] === "asc" ? 1 : -1
         sort[field] = order
      }
 
      if(completed){
         match.completed = completed === "true" ? true : false
      }

      await req.user.populate({
         path: "tasks",
         match,
         options:{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
         }
      }).execPopulate()
      res.status(200).send(req.user.tasks)
   }catch(err){
      log_err(err)
      res.status(400).send(err) 
   }
})

router.get("/tasks/:id", auth, (req, res) => {
   Task.findOne({_id: req.params.id, owner: req.user._id}).then((task) => {

      if(!task){
         res.status(404).send()
      }
 
      res.status(200).send(task)
  
   }).catch((err) => {
      res.status(500).send(err)
   })
})

router.patch("/tasks/:id", auth,  async (req, res) =>{

   const updates = Object.keys(req.body)
   const allowedUpdates = ["completed", "description"]
   const isValidOperation = updates.every((update)=>  allowedUpdates.includes(update))

   if(!isValidOperation){
      return res.status(400).send({error: "Invalid updates!"})
   }

   try{
      //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators:true})
      const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
     // const task = await Task.findById(req.params.id)
      //log(task)
      if(!task){
         return res.status(404).send()
      }

      updates.forEach((update) => {
         task[update] = req.body[update]
      })

      await task.save()

      res.status(200).send(task)
   }catch(err){
      res.status(400).send(err)
   }
})


router.delete("/tasks/:id", auth, async (req, res)=>{

   try{
      const _id = req.params.id
 
      const tasks = await Task.findOneAndDelete({_id, owner: req.user._id})
      log(tasks)
      if(!tasks){
      //   console.log(user)
         return res.status(404).send()
      }
      res.status(200).send(tasks)
   }catch(err){
      log_err(err)
      res.status(400).send(err)
   }
})

router.post("/tasks", auth, (req, res) => {


   const task = new Task({
      ...req.body,
      owner: req.user._id
   })
   
   log(task)

   task.save().then(() => {

      res.status(201).send(task)
   }).catch((err) => {
      res.status(400).send(err)
   })

})

module.exports = router