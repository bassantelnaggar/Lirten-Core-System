const express = require('express')
const app = express()
const pg = require('pg')
const dotenv = require('dotenv')
dotenv.config()
const connectionString = process.env.DATABASE_URL
const client = new pg.Client(connectionString)
const { createTables } = require('./api/scripts/tablesCreationScript')
const { populateTables } = require('./api/scripts/populationScript')
const mongoose = require('mongoose')
let http = require('http').Server(app)
let io = require('socket.io-client')(http)

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
  //.then(() => client.query(createTables()))
  // .then(() => client.query(populateTables()))
  .catch(e => console.log('Failed to connect with the database 😪 .'))

// User routes
app.use('/api/users', users)

// Task routes
app.use('/api/tasks', tasks)

//Meeting routes
app.use('/api/meetings', meetings)

io.connect(
  'http://127.0.0.1:8080',
  { reconnect: true },
  console.log('A user is connected')
)

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_ATLAS_USER}:${
      process.env.MONGO_ATLAS_PASSWORD
    }@trail-mflro.mongodb.net/mydb`
  )
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err))

const port = process.env.PORT || 5000
http.listen(port, () => console.log(`Server up and running on ${port} 👍 .`))
