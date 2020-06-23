const { log, log_err, log_warn } = require("../utils/logs")

const userRouter = require("./routers/user")
const taskRouter = require("./routers/task")

require("./db/mongoose")

const express = require("express")

const app = express()

const port = process.env.PORT

// app.use( async (req,res,next) =>{

//    log_warn(req.method)
//    log_warn(req.path)

//    next()
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)



app.get("/", (req, res) => {
   res.send({ text: "Hi there" })
})



app.listen(port, () => {
   log("server is up on port", port)
})

const jwt = require("jsonwebtoken")
   
const Task = require("./models/task")
const User = require("./models/user")
 
 const f = async () => {
      const task = await Task.findById("5eeb6c78a7df2d2ef48e7096")
      await task.populate("owner").execPopulate()
     //log(task.owner)

      const user = await User.findById("5eeb6af621892928982dbce4")

      await user.populate("tasks").execPopulate()   
      log(user.tasks)
      
 }

//f()



