const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
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


app.post('/students/login', async (req,res)=>{
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

  let result;

  try{
    result = await db.executeQuery(query);
    }catch(myError){
    console.log('error in /request/login:', myError);
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
      let token = jwt.sign({pk: user.studentPK}, config.JWT, {expiresIn: '60 minutes'} )

    console.log(token)

    //4. save the token in db and send token and user info back to user
    let setTokenQuery = `UPDATE student
    SET Token = '${token}'
    WHERE studentPK = ${user.studentPK}`

    try{
        await db.executeQuery(setTokenQuery)

        res.status(200).send({
            token: token,
            user: {
                NameFirst: user.NameFirst,
                NameLast: user.NameLast,
                Email: user.Email,
                studentPK: user.studentPK
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

app.listen(5000, ()=>{
console.log("app is running on port 5000")
})

