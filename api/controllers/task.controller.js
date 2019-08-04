const taskFunctions = require('../helpers/functions/task.function')
const userFunctions = require('../helpers/functions/user.function')

exports.createTask = async (req, res) => {
  const { taskName, taskOwner, deadline } = req.body.body
  if (await taskFunctions.checkDeadline(res, deadline)) {
    if (await userFunctions.checkUser(res, taskOwner)) {
      if (await userFunctions.checkSuspension(res, taskOwner)) {
        await taskFunctions.createTask(res, taskName, taskOwner, deadline)
      }
    }
  }
}

exports.viewTaskList = async (req, res) => {
  const { page, limit } = req.body.body
  await taskFunctions.getTasks(res, page, limit)
}

exports.viewMyTasks = async (req, res) => {
  const { userId } = req.body
  await taskFunctions.viewMyTasks(res, userId)
}

exports.freezeTask = async (req, res) => {
  const { taskId, frozen } = req.body.body
  if (await taskFunctions.taskExists(res, taskId)) {
    if (frozen) {
      if (await taskFunctions.checkAlreadyFrozenTask(res, taskId)) {
        await taskFunctions.freezeTask(res, taskId, frozen)
      }
    } else {
      if (await taskFunctions.checkAlreadyUnfrozenTask(res, taskId)) {
        await taskFunctions.freezeTask(res, taskId, frozen)
      }
    }
  }
}

exports.applyTask = async (req, res) => {
  const { taskId, applicantId } = req.body.body
  if (await taskFunctions.taskExists(res, taskId)) {
    let deadline = await taskFunctions.getTaskDeadline(taskId)
    // if (await taskFunctions.checkDeadline(res, deadline)) {
    if (!(await taskFunctions.checkAcceptedApplicant(res, taskId))) {
      if (await userFunctions.checkUser(res, applicantId)) {
        if (await userFunctions.checkSuspension(res, applicantId)) {
          if (
            await taskFunctions.checkTaskApplyingStatus(taskId, applicantId)
          ) {
            await taskFunctions.applyTask(res, taskId, applicantId)
          }
        }
        // }
      }
    }
  }
}

exports.acceptApplicant = async (req, res) => {
  const { taskId, applicantId } = req.body.body
  if (await taskFunctions.taskExists(res, taskId)) {
    let deadline = await taskFunctions.getTaskDeadline(taskId)
    // if (await taskFunctions.checkDeadline(res, deadline)) {
    if (!(await taskFunctions.checkAcceptedApplicant(res, taskId))) {
      if (await userFunctions.checkUser(res, applicantId)) {
        if (await userFunctions.checkSuspension(res, applicantId)) {
          await taskFunctions.acceptApplicant(res, taskId, applicantId)
        }
      }
    }
    //}
  }
}

exports.submitTask = async (req, res) => {
  const { taskId, acceptedApplicant, submission } = req.body.body
  if (await taskFunctions.taskExists(res, taskId)) {
    // if (await taskFunctions.checkDeadline(res, deadline)) {
    if (await userFunctions.checkUser(res, acceptedApplicant)) {
      if (await userFunctions.checkSuspension(res, acceptedApplicant)) {
        if (!(await taskFunctions.checkSubmissionStatus(res, taskId))) {
          if (
            await taskFunctions.checkApplicantSubmission(
              taskId,
              acceptedApplicant
            )
          ) {
            await taskFunctions.submitTask(res, taskId, submission)
          }
        }
      }
    }
    //}
  }
}

exports.confirmTask = async (req, res) => {
  const { taskId, confirmed } = req.body.body
  if (await taskFunctions.taskExists(res, taskId)) {
    if (!(await taskFunctions.checkTaskConfirmation(res, taskId))) {
      await taskFunctions.confirmTask(res, taskId, confirmed)
    }
  }
}

exports.editTask = async (req, res) => {
  const { taskId, dataToEdit } = req.body.body
  if (await taskFunctions.taskExists(res, taskId)) {
    if (!(await taskFunctions.checkAcceptedApplicant(res, taskId))) {
      await taskFunctions.editTask(res, taskId, dataToEdit)
    }
  }
}

exports.sortFilteredTasks = async (req, res) => {
  const { page, limit, filter, sortBy } = req.body.body
  await taskFunctions.sortFilteredTasks(res, page, limit, filter, sortBy)
}
