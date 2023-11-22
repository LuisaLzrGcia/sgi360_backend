const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const config = require("../database/dbConfig");
const { Connection } = require("tedious");

function getUsers(req, res) {
  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    } else {
      const request = new Request("SELECT * FROM [dbo].[user];", (err) => {
        if (err) {
          connection.close();
          return;
        }
      });
      let results = [];
      request.on("row", (columns) => {
        const result = {};
        columns.forEach((column) => {
          result[column.metadata.colName] =
            column.value === null ? null : column.value.toString();
        });
        results.push(result);
      });
      request.on("requestCompleted", (rowCount, more) => {
        connection.close();
        res.status(200).json(results);
        return;
      });
      connection.execSql(request);
    }
  });
}

async function getUserById(req, res) {
  const userId = req.params.id;
  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    } else {
      const request = new Request(
        `SELECT * FROM [dbo].[user] WHERE id_user_pk=${userId}`,
        (err) => {
          if (err) {
            console.error(err);
            connection.close();
          }
        }
      );
      let results = [];
      request.on("row", (columns) => {
        const result = {};
        columns.forEach((column) => {
          result[column.metadata.colName] =
            column.value === null ? null : column.value.toString();
        });
        results.push(result);
      });
      request.on("requestCompleted", (rowCount, more) => {
        if (rowCount === 0) {
          connection.close();
          res.status(200).json([]);
          return;
        } else {
          connection.close();
          res.status(200).json(results);
          return;
        }
      });
      connection.execSql(request);
    }
  });
}

async function createUser(req, res) {
  const newUser = req.body;
  const connection = new Connection(config);
  connection.connect();
  connection.on("connect", function (err) {
    if (err) {
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      const request = new Request(
        `INSERT INTO [dbo].[user] (user_name, password, first_name, last_name, job_title, type, id_process_fk) OUTPUT INSERTED.id_user_pk
      VALUES (@user_name, @password, @first_name, @last_name, @job_title, @type, @id_process_fk)`,
        function (err) {
          if (err) {
            connection.close();
            res.status(500).json({ error: "Error interno del servidor" });
            return;
          }
        }
      );
      request.addParameter("user_name", TYPES.VarChar, newUser.newUsername);
      request.addParameter("password", TYPES.VarChar, newUser.newPassword);
      request.addParameter("first_name", TYPES.VarChar, newUser.newFirstName);
      request.addParameter("last_name", TYPES.VarChar, newUser.newLastName);
      request.addParameter("job_title", TYPES.VarChar, newUser.newJobTitle);
      request.addParameter("type", TYPES.VarChar, newUser.newTypeUser);
      request.addParameter("id_process_fk", TYPES.Int, newUser.newIdProcess);
      request.on("row", function (columns) {
        columns.forEach(function (column) {
          if (column.value === null) {
            console.log("NULL");
          } else {
            console.log("user inserted " + column.value);
          }
        });
      });
      request.on("requestCompleted", function (rowCount, more) {
        connection.close();
        res.status(201).send({ status: "Successfully" });
        return;
      });
      request.on("error", function (err) {
        connection.close();
        res.status(500).send({ error: "Error interno del servidor" });
        return;
      });
      connection.execSql(request);
    }
  });
}

async function updateUser(req, res) {
  const updatedUser = req.body;
  const connection = new Connection(config);
  connection.connect();
  connection.on("connect", function (err) {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      return
    } else {
      const request = new Request(
        `
        UPDATE [dbo].[user]
        SET user_name = @user_name, password = @password, first_name = @first_name,
            last_name = @last_name, job_title = @job_title, type = @type, id_process_fk = @id_process_fk
        WHERE id_user_pk = @userId
        `,
        function (err) {
          if (err) {
            connection.close();
            res.status(500).json({ error: "Error interno del servidor" });
            return;
          }
          connection.close();
        }
      );
      request.addParameter("user_name", TYPES.VarChar, updatedUser.newUsername);
      request.addParameter("password", TYPES.VarChar, updatedUser.newPassword);
      request.addParameter(
        "first_name",
        TYPES.VarChar,
        updatedUser.newFirstName
      );
      request.addParameter("last_name", TYPES.VarChar, updatedUser.newLastName);
      request.addParameter("job_title", TYPES.VarChar, updatedUser.newJobTitle);
      request.addParameter("type", TYPES.VarChar, updatedUser.newTypeUser);
      request.addParameter(
        "id_process_fk",
        TYPES.Int,
        updatedUser.newIdProcess
      );
      request.addParameter("userId", TYPES.Int, updatedUser.userId);
      request.on("requestCompleted", function (rowCount, more) {
        connection.close();
        res.status(201).json({ status: "Successfully" });
        return
      });
      request.on("error", function (err) {
        connection.close();
        res.status(500).json({ error: "Error interno del servidor" });
        return
      });
      connection.execSql(request);
    }
  });
}

async function deleteUser(req, res) {
  const idUser = req.params.idUser;
  const connection = new Connection(config);
  connection.connect();
  connection.on("connect", function (err) {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      return
    } else {
      const request = new Request(
        `DELETE FROM [dbo].[user] WHERE id_user_pk = @idUser`,
        function (err) {
          if (err) {
            res.status(500).json({ error: "Error interno del servidor" });
            connection.close();
            return;
          }
        }
      );
      request.addParameter("idUser", TYPES.Int, idUser);
      request.on("requestCompleted", function (rowCount, more) {
        connection.close();
        res.status(201).send({ status: "Successfully" });
        return
      });
      request.on("error", function (err) {
        connection.close();
        res.status(500).send({ error: "Error interno del servidor" });
        return
      });
      connection.execSql(request);
    }
  });
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
