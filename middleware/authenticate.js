const jwt = require('jsonwebtoken');

const db = require('../dbConnectExect.js')
const config=('../config.js')

const auth = async(req, res, next)=>{
    console.log(req.header('Authorization'))
    
    try{

         //1. decode token

         let myToken = req.header('Authorization').replace('Bearer ','')
         // console.log(myToken)
 
         let decodedToken = jwt.verify(myToken, config.JWT)
         // console.log(decodedToken)
 
         let StudentPK = decodedToken.pk;
        //  console.log(studentPK)
 
 
         //2. compare token with db token
         let query = `SELECT StudentPK, NameFirst, NameLast, Email
         FROM student
         WHERE StudentPK = ${studentPK} and Token = ${myToken}`
 
         let returnedUser = await db.executeQuery(query)
        //  console.log(returnedUser)
         //3. save user information in request
         if(returnedUser[0]){
             req.student = returnedUser[0];
             next()
         }
         else{res.status(401).send('Authentication failed.')}
 
     }catch(myError){
         res.status(401).send("Authentication failed.")
     }
 }

module.exports = auth