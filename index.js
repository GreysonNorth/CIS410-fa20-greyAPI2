const express = require('express')
const db = require('./dbConnectExect.js');
const app = express();

app.get("/request", (rep, res)=>{
    var query = `SELECT * 
FROM Request`
    res.send("hello world")
})

// app.post("/contacts", (req, res)=> {
//     res.send("creating user")
//     console.log("request body", req.body)

//     var nameFirst = req.body.nameFirst;
//     var nameLast = req.body.nameLast;
//     var email = req.body.email;
//     var password = req.body.password;



// })

app.get("/test",(rep, res)=>{
    //get data from database
    db.executeQuery(`SELECT *
    FROM Request
    LEFT JOIN submission
    ON Request.RequestPK =submission.requestFK`)
    .then((result)=>{
        res.status(200).send(result)
     })
     .catch((error)=>{
         console.log(error)
         res.status(500).send()
     })
})

app.listen(5000, ()=>{
console.log("app is running on port 5000")
})

