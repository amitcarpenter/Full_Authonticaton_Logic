const mongoose = require("mongoose")

const dbConnect = mongoose.connect("mongodb://127.0.0.1/task").then((e)=>{
    console.log(`Db Connected with ${e.connection.host}`)

}).catch((err)=>{
    console.log("Mongo Connection Error :::::"  +err)
})
// const dbConnect = mongoose.connect("mongodb+srv://nodejsboy:amit93023@cluster1.kbabkvr.mongodb.net/").then((e)=>{
//     console.log(`Db Connected with ${e.connection.host}`)

// }).catch((err)=>{
//     console.log("Mongo Connection Error :::::"  +err)
// })

module.exports=dbConnect