const express = require('express')
const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken')
// const cors = require('cors')



const app = express();
app.use(express.json())
// app.use(cors())

const db = require('./dbConnectExect.js');
const config = require('./config.js')
// const auth = require('./middleware/authenticate')

app.get("/test", (rep, res)=>{
    var query = `SELECT * 
FROM Request`
    res.send("hello world")
})

app.post("/students", async (req, res)=> {
    // res.send("creating user")
    console.log("request body", req.body)

    var nameFirst = req.body.nameFirst;
    var nameLast = req.body.nameLast;
    var email = req.body.email;
    var password = req.body.password;

    if(!nameFirst || !nameLast  || !email || !password){
        return res.status(400).send("bad request")
    }

    nameFirst = nameFirst.replace("'","''")
    nameLast = nameLast.replace("'","''")
    
    var emailCheckQuery = `SELECT email
    FROM student
    WHERE email = '${email}'`

   var existingUser = await db.executeQuery(emailCheckQuery)

    // console.log("existing user", existingUser)
    if(existingUser[0]){
        return res.status(409).send('Please enter a different email.')
    }

    var hashedPassword = bcrypt.hashSync(password)

    var insertQuery = `INSERT INTO student (NameFirst, NameLast,Email,Password)
    VALUES('${nameFirst}','${nameLast}','${email}','${hashedPassword}')`

    db.executeQuery(insertQuery)
        .then(()=>{res.status(201).send()})
        .catch((err)=>{
            console.log("error in POST /request",err)
            res.status(500).send()
        })
})

app.get("/request",(rep, res)=>{
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

