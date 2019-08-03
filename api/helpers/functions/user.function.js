exports.getUsers = `SELECT * FROM USERS `

exports.checkUsername = username =>
  `SELECT * FROM USERS U  WHERE U.username=` + "'" + username + "'"

exports.checkEmail = email =>
  `SELECT * FROM USERS U  WHERE U.email=` + "'" + email + "'"

exports.createUser = (username, email, password) =>
  ` INSERT INTO USERS VALUES (2,` +
  "'" +
  username +
  "'," +
  "'" +
  email +
  "'," +
  "'" +
  password +
  "'" +
  `)`
