const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cors = require('cors')


//azurewebsite.et
const app = express();
app.use(express.json())
app.use(cors())

const db = require('./dbConnectExect.js');
const config = require('./config.js')
const auth = require('./middleware/authenticate')

app.post('/student/logout', auth, (rep, res)=>{
    var query = `UPDATE student
    SET Token = NULL
    WHERE studentPK = ${rep.student.studentPK}`

    db.executeQuery(query).then(()=> {res.status(200).send()})
    .catch((error)=>{console.log("error in POST /student/logout", error)
    res.status(500).send()
})
})



app.get('/submission/me', auth, async(req, res)=>{
    res.send(req.student)
})





// app.patch("/submission/:pk", auth, async(req, res)=>{
//     let submissionPK = req.params.pk
// })
app.get("/", (req, res)=>{res.send("Hello World.")})

app.post("/submission", auth, async (req, res)=>{

    try{
        var requestFK = req.body.requestFK
        var location = req.body.location
        var workerFK = req.body.workerFK
    
        if(!requestFK || !location || !workerFK){res.status(400).send("bad request")}

        summary = summary.replace("'", "'")
            // res.send("here is your response")}

            let insertQuery = `INSERT INTO submission(requestFK,workerFK,location)
            OUTPUT inserted.submissionID, inserted.requestFK, inserted.workerFK, inserted.location
            VALUES('${requestFK}', '${workerFK}', '${location}')`

           let insertedSubmission = await db.executeQuery(insertQuery)

           res.send(201).send(insertedSubmission[0])
            }
            catch(error){
                res.status(500).send()
            }
    
})

app.get('/student/me', auth, (req, res)=>{
res.send(req.student)
})

app.get("/test", (rep, res)=>{
    var query = `SELECT * 
FROM Request`
    res.send("hello world")
})


app.post('/student/login', async (req,res)=>{
  console.log(req.body)
 
  var email = req.body.email;
  var password = req.body.password;

  if(!email || !password){
    return res.status(400).send('bad request')
  }

  //1. check that user email exists in db
  var query = `SELECT *
  FROM student
  WHERE Email = '${email}'`
console.log(query)

  let result;

  try{
    result = await db.executeQuery(query);
    }catch(myError){
    console.log('error in /student/login:', myError);
    return res.status(500).send()
}

  console.log(result)
  if(!result[0]){return res.status(400).send('Invalid user credentials')}

      //2. check their password

      let user = result[0]
      // console.log(user)
  
      if(!bcrypt.compareSync(password,user.Password)){
          console.log("invalid password");
          return res.status(400).send("Invalid user crendentials")
      }
  
      //3. generate a token
      let token = jwt.sign({pk: user.StudentPK}, config.JWT, {expiresIn: '60 minutes'} )

    console.log(token)

    //4. save the token in db and send token and user info back to user
    let setTokenQuery = `UPDATE student
    SET Token = '${token}'
    WHERE studentPK = ${user.StudentPK}`

    try{
        await db.executeQuery(setTokenQuery)

        res.status(200).send({
            token: token,
            user: {
                NameFirst: user.NameFirst,
                NameLast: user.NameLast,
                Email: user.Email,
                studentPK: user.StudentPK
            }
        })
    }
    catch(myError){
        console.log("error setting user token ", myError);
        res.status(500).send()
    }

})

app.post("/students", async (req, res)=> {
    // res.send("creating user")
    // console.log("request body", req.body)

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

app.get("/request/:pk", (req, res)=> {
    var pk = req.params.pk

    var myQuery = `SELECT *
    FROM Request
    LEFT JOIN student
    ON student.StudentPK = Request.studentFK
    WHERE RequestPK = ${pk}`

    db.executeQuery(myQuery).then((requests)=>{
        if(requests[0]){
            res.send(requests[0])
        }else{res.status(404).send('bad request')}
    })
    .catch((err)=>{
        console.log("Error in /request/pk", err)
        res.status(500).send()
    })

})

const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>{console.log(`app is running on port ${PORT}`)})

