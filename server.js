const express = require('express')
const app = express()
const pg = require('pg')
const dotenv = require('dotenv')
dotenv.config()
const connectionString = process.env.DATABASE_URL
const client = new pg.Client(connectionString)
const { createTables } = require('./api/scripts/tablesCreationScript')
const { populateTables } = require('./api/scripts/populationScript')

// import route handlers

// User
const users = require('./api/routes/user.router')

// Task
const tasks = require('./api/routes/task.router')

// Meeting
const meetings = require('./api/routes/meeting.router')

// import middleware
const loggerMiddleware = require('./api/middleware/logger')

// init middleware

app.use(express.json())
// app.use(express.urlencoded({ extended: false }))
// app.use(loggerMiddleware)

//  connection to the database

client
  .connect()
  .then(() => console.log('Connected to the database 💃 .'))
  // .then(() => client.query(createTables()))
  // .then(() => client.query(populateTables()))
  .catch(e => console.log('Failed to connect with the database 😪 .'))

// User routes
app.use('/api/v1/users', users)

// Task routes
app.use('/api/v1/tasks', tasks)

//Meeting routes
app.use('/api/v1/meetings', meetings)

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server up and running on ${port} 👍 .`))
