const sql = require('mssql')
const rockwellConfig = require('./config.js')

const config = {
    user: rockwellConfig.db.user,
    password: rockwellConfig.db.password,
    server:  rockwellConfig.db.server,
    database: rockwellConfig.db.database,
}

async function executeQuery(aQuery){
    var connection = await sql.connect(config)
    var result = await connection.query(aQuery)
    
    return result.recordset

}
module.exports = {executeQuery: executeQuery}
// executeQuery(`SELECT *
// FROM Request
// LEFT JOIN submission
// ON Request.RequestPK =submission.requestFK`)