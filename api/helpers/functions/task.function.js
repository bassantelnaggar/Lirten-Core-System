const pg = require('pg')
const connectionString = process.env.DATABASE_URL
const client = new pg.Client(connectionString)
client.connect()

exports.getTasks = async (res, page, limit) => {
  client
    .query(`SELECT * FROM TASKS LIMIT ` + page + `OFFSET ` + limit)
    .then(results => res.status(200).json(results.rows))
    .catch(err => console.log(err))
}
exports.getTaskDeadline = async taskId => {
  let deadline
  let length
  await client
    .query(`SELECT * FROM TASKS T  WHERE T.id=` + taskId)
    .then(results => [
      (length = results.rows.length),
      (deadline = results.rows[0].deadline)
    ])
    .catch(err => console.log(err))

  if (length === 1) {
    return deadline
  }
  return null
}

exports.viewMyTasks = async (res, userId) => {
  client
    .query(`SELECT * FROM TASKS T WHERE T.accepted_applicant=` + userId)
    .then(results => res.status(200).json(results.rows))
    .catch(err => console.log(err))
}

exports.taskExists = async taskId => {
  let length
  await client
    .query(`SELECT * FROM TASKS T WHERE T.id=` + taskId)
    .then(results => (length = results.rows.length))
    .catch(err => console.log(err))

  if (length === 1) {
    return true
  }
  return false
}

exports.checkDeadline = async (res, date) => {
  let today = new Date()
  let currentDay = today.getDate()
  let currentMonth = today.getMonth() + 1
  let currentYear = today.getFullYear()
  if (currentDay < 10) {
    currentDay = '0' + currentDay
  }
  if (currentMonth < 10) {
    currentMonth = '0' + currentMonth
  }
  currentDate = currentYear + '-' + currentMonth + '-' + currentDay
  if (currentDate < date) {
    return true
  } else {
    res.json('Deadline is behind')
    return false
  }
}

exports.createTask = async (res, taskName, taskOwner, deadline) => {
  let id
  await client
    .query(`SELECT id FROM  TASKS ORDER BY id DESC LIMIT 1`)
    .then(results =>
      results.rows.length === 0 ? (id = 0) : (id = results.rows[0].id)
    )
    .catch(err => console.log(err))

  id += 1

  await client
    .query(
      ` INSERT INTO TASKS VALUES (` +
        id +
        `,` +
        "'" +
        taskName +
        "'," +
        "'" +
        taskOwner +
        "'," +
        "'" +
        deadline +
        "'" +
        `)`
    )
    .then(() =>
      client
        .query(
          `SELECT id,task_name,task_owner,deadline FROM TASKS T WHERE T.id=` +
            "'" +
            id +
            "'"
        )
        .then(results => res.status(200).json(results.rows))
        .catch(err => console.log(err))
    )
}

exports.checkTaskConfirmation = async (res, taskId) => {
  let confirmation
  await client
    .query(`SELECT * FROM TASKS T WHERE T.id=` + taskId)
    .then(results => (confirmation = results.rows[0].confirmed))
    .catch(err => console.log(err))
  if (confirmation) {
    res.json('Task has been confirmed before')
    return true
  }
  return false
}

exports.checkFrozenTask = async taskId => {
  let frozen
  await client
    .query(`SELECT * FROM TASKS T WHERE T.id=` + taskId)
    .then(results => (frozen = results.rows[0].frozen))
    .catch(err => console.log(err))
  if (frozen) {
    return true
  }

  return false
}

exports.freezeTask = async (res, taskId, status) => {
  await client.query(
    `UPDATE TASKS T SET frozen = ` + status + ` WHERE T.id= ` + taskId
  )

  if (status) {
    res.json('Task frozen successfully')
  } else {
    res.json('Task unfrozen successfully')
  }
}

exports.checkTaskApplyingStatus = async (taskId, userId) => {
  let length
  await client
    .query(
      `SELECT * FROM TASKPROPOSALS TP WHERE TP.task_id=` +
        taskId +
        ` AND TP.applicant_id=` +
        userId
    )
    .then(results => (length = results.rows.length))
    .catch(err => console.log(err))
  if (length === 0) {
    return true
  }
  return false
}

exports.checkAcceptedApplicant = async (res, taskId) => {
  let acceptedApplicant
  await client
    .query(`SELECT * FROM TASKS T WHERE T.id=` + taskId)
    .then(results => (acceptedApplicant = results.rows[0].accepted_applicant))
    .catch(err => console.log(err))
  if (acceptedApplicant !== null) {
    res.json('Task has an accepted applicant')
    return true
  }
  return false
}

exports.applyTask = async (res, taskId, userId) => {
  client
    .query(`INSERT INTO TASKPROPOSALS VALUES (` + taskId + `,` + userId + `)`)
    .then(() =>
      client
        .query(
          `SELECT task_id,applicant_id FROM TASKPROPOSALS TP WHERE TP.task_id=` +
            taskId +
            `AND TP.applicant_id=` +
            userId
        )
        .then(results => res.status(200).json(results.rows))
        .catch(err => console.log(err))
    )
}

exports.acceptApplicant = async (res, taskId, userId) => {
  await client.query(
    `UPDATE TASKS T SET accepted_applicant =` +
      userId +
      `  WHERE T.id=` +
      taskId
  )
  res.json('User has been accepted')
}

exports.checkSubmissionStatus = async (res, taskId) => {
  let taskSubmission
  await client
    .query(`SELECT * FROM TASKS T WHERE T.id=` + taskId)
    .then(results => (taskSubmission = results.rows[0].submission))
    .catch(err => console.log(err))
  if (taskSubmission !== null) {
    res.json(`The task has already been submitted`)
    return true
  }
  return false
}

exports.checkApplicantSubmission = async (taskId, accepedApplicant) => {
  let length
  await client
    .query(
      `SELECT * FROM TASKS T WHERE T.id=` +
        taskId +
        `AND T.accepted_applicant=` +
        accepedApplicant
    )
    .then(results => (length = results.rows.length))
    .catch(err => console.log(err))
  if (length === 1) {
    return true
  }
  return false
}

exports.submitTask = async (res, taskId, submission) => {
  await client.query(
    `UPDATE TASKS T SET submission ='` +
      submission +
      "'" +
      `  WHERE T.id=` +
      taskId
  )
  res.json('Task has been submitted')
}

exports.confirmTask = async (res, taskId, confirmed) => {
  await client.query(
    `UPDATE TASKS T SET confirmed =` + confirmed + `  WHERE T.id=` + taskId
  )
  res.json('Task confirmed successfully')
}

exports.editTask = async (res, taskId, dataToEdit) => {
  let noEditData = []
  for (let i = 0; i < dataToEdit.length; i++) {
    if (dataToEdit[i][0] === 'taskName') {
      await client.query(
        `UPDATE TASKS T SET task_name ='` +
          dataToEdit[i][1] +
          "'" +
          `  WHERE T.id=` +
          taskId
      )
    } else {
      if (dataToEdit[i][0] === 'deadline') {
        await client.query(
          `UPDATE TASKS T SET deadline ='` +
            dataToEdit[i][1] +
            "'" +
            `  WHERE T.id=` +
            taskId
        )
      } else {
        noEditData += dataToEdit[i][0]
      }
    }
  }
  if (noEditData.length === 0) {
    res.json('Task updated successfully')
  } else {
    res.json(noEditData + ' can not be edited')
  }
}

exports.sortFilteredTasks = async (res, page, limit, filter, sortBy) => {
  const query = filter.map(condition => {
    if (condition.filterBy === 'task_name' || condition.filterBy === 'deadline')
      return condition.filterBy + '=' + "'" + condition.feature + "'"
    else return condition.filterBy + '=' + condition.feature
  })
  let sqlQuery = ''
  for (let i = 0; i < query.length; i++) {
    if (i === query.length - 1) sqlQuery = sqlQuery + query[i]
    else sqlQuery = sqlQuery + query[i] + ' AND '
  }
  client
    .query(
      `SELECT * FROM TASKS WHERE ` +
        sqlQuery +
        ` ORDER BY ` +
        sortBy[0] +
        ' ' +
        sortBy[1] +
        ` LIMIT ` +
        limit +
        `OFFSET ` +
        page
    )
    .then(results => res.status(200).json(results.rows))
    .catch(err => console.log(err))
}
