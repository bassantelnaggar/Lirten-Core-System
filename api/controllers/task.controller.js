const taskFunctions = require('../helpers/functions/task.function')
const userFunctions = require('../helpers/functions/user.function')

exports.createTask = async (req, res) => {
  const { taskName, taskOwner, deadline } = req.body
  if (await taskFunctions.checkDeadline(res, deadline)) {
    await taskFunctions.createTask(res, taskName, taskOwner, deadline)
  }
}

exports.viewTaskList = async (req, res) => {
  const { page, limit } = req.body
  await taskFunctions.getTasks(res, page, limit)
}

exports.viewMyTasks = async (req, res) => {
  const { userId } = req.body
  await taskFunctions.viewMyTasks(res, userId)
}

exports.freezeTask = async (req, res) => {
  const { taskId, frozen } = req.body
  if (await taskFunctions.taskExists(taskId)) {
    if (frozen) {
      if (await taskFunctions.checkFrozenTask(taskId)) {
        res.json('Task already frozen')
      } else {
        await taskFunctions.freezeTask(res, taskId, frozen)
      }
    } else {
      if (!(await taskFunctions.checkFrozenTask(taskId))) {
        res.json('Task already unfrozen')
      } else {
        await taskFunctions.freezeTask(res, taskId, frozen)
      }
    }
  }
}

exports.applyTask = async (req, res) => {
  const { taskId, applicantId } = req.body
  if (await taskFunctions.taskExists(taskId)) {
    let deadline = await taskFunctions.getTaskDeadline(taskId)
    // if (await taskFunctions.checkDeadline(res, deadline)) {
    if (!(await taskFunctions.checkAcceptedApplicant(taskId))) {
      if (await userFunctions.checkUser(applicantId)) {
        if (!(await userFunctions.checkSuspension(res, applicantId))) {
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
  const { taskId, applicantId } = req.body
  if (await taskFunctions.taskExists(taskId)) {
    let deadline = await taskFunctions.getTaskDeadline(taskId)
    // if (await taskFunctions.checkDeadline(res, deadline)) {
    if (!(await taskFunctions.checkAcceptedApplicant(res, taskId))) {
      if (await userFunctions.checkUser(applicantId)) {
        if (!(await userFunctions.checkSuspension(res, applicantId))) {
          await taskFunctions.acceptApplicant(res, taskId, applicantId)
        }
      }
    }
    //}
  }
}

exports.submitTask = async (req, res) => {
  const { taskId, acceptApplicant, submission } = req.body
  if (await taskFunctions.taskExists(taskId)) {
    // if (await taskFunctions.checkDeadline(res, deadline)) {
    if (await userFunctions.checkUser(acceptApplicant)) {
      if (!(await userFunctions.checkSuspension(res, acceptApplicant))) {
        if (!(await taskFunctions.checkSubmissionStatus(res, taskId))) {
          if (
            await taskFunctions.checkApplicantSubmission(
              taskId,
              acceptApplicant
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
  const { taskId, confirmed } = req.body
  if (await taskFunctions.taskExists(taskId)) {
    if (!taskFunctions.checkTaskConfirmation(res, taskId)) {
      await taskFunctions.confirmTask(res, taskId, confirmed)
    }
  }
}
