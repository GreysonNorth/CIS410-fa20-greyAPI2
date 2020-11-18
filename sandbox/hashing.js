const bcrypt = require('bcryptjs')

var hashedPassword = bcrypt.hashSync('abcde')

console.log(hashedPassword)

var hashTest = bcrypt.compareSync('abcde',hashedPassword)
console.log(hashTest)