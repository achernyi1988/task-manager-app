const { log, log_err, log_warn } = require("../../utils/logs")

const mongoose = require('mongoose');

const connectionURL = process.env.MONGODB_URL + "/task-manager-app"



mongoose.connect(connectionURL, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   useFindAndModify:false,
   useCreateIndex: true
})