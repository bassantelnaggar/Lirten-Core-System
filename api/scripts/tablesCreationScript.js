const createTables = () =>
  `CREATE TABLE Users (
      id INTEGER GENERATED BY DEFAULT AS IDENTITY,
      username VARCHAR(20) NOT NULL,
      email VARCHAR(254)NOT NULL,
      password VARCHAR(255) NOT NULL,
      suspended BOOLEAN DEFAULT false,
      frozen BOOLEAN DEFAULT false,
      UNIQUE(username),
      UNIQUE(email),
      PRIMARY KEY (id)
      );

      CREATE TABLE Tasks (
      id INTEGER GENERATED BY DEFAULT AS IDENTITY,
      task_name VARCHAR(50) NOT NULL,
      task_owner INTEGER REFERENCES Users (id) NOT NULL,
      deadline TIMESTAMP NOT NULL,
      accepted_applicant INTEGER REFERENCES Users (id),
      submission TEXT,
      confirmed BOOLEAN DEFAULT false,
      frozen BOOLEAN DEFAULT false,
      PRIMARY KEY (id)
      );

      CREATE TABLE TaskProposals (
      task_id INTEGER REFERENCES Tasks (id),
      applicant_id INTEGER REFERENCES Users (id),
      frozen BOOLEAN DEFAULT false,
      PRIMARY KEY (task_id,applicant_id)
      );

      CREATE TABLE Meetings (
      id INTEGER GENERATED BY DEFAULT AS IDENTITY,
      meeting_title VARCHAR(50) NOT NULL,
      location TEXT NOT NULL,
      date TIMESTAMP NOT NULL,
      organizer INTEGER REFERENCES Users (id) NOT NULL,
      confirmed BOOLEAN DEFAULT false,
      frozen BOOLEAN DEFAULT false,
      PRIMARY KEY (id)
      );

      CREATE TABLE TaskMeetings (
      task_id INTEGER REFERENCES Tasks (id),
      meeting_id INTEGER REFERENCES Meetings (id),
      attendee_id INTEGER REFERENCES Users (id),
      confirmation BOOLEAN DEFAULT false,
      frozen BOOLEAN DEFAULT false,
      PRIMARY KEY (task_id,meeting_id,attendee_id)
      );
      `

module.exports = { createTables }
