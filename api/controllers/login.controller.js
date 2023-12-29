const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const config = require("../database/dbConfig");
const { Connection } = require("tedious");

async function loginUser(req, res) {
  const { username, password } = req.body;
  const connection = new Connection(config);
  connection.connect();
  connection.on("connect", function (err) {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    } else {
      const request = new Request(
        `SELECT * FROM [dbo].[user_process] WHERE user_name = @username AND password = @password`,
        function (err) {
          if (err) {
            connection.close();
            res.status(500).json({ error: "Error interno del servidor" });
            return;
          }
        }
      );
      request.addParameter("username", TYPES.VarChar, username);
      request.addParameter("password", TYPES.VarChar, password);
      let userFound = false;
      let userObject = {}; 

      request.on("row", (columns) => {
        columns.forEach((column) => {
          userObject[column.metadata.colName] =
            column.value === null ? null : column.value.toString();
        });
        userFound = true;
      });

      request.on("requestCompleted", function () {
        connection.close();
        if (userFound) {
          connection.close();
          res.status(200).json(userObject);
          return;
        } else {
          connection.close();
          res.status(404).json({ error: "User not found" });
          return;
        }
      });

      request.on("error", function (err) {
        connection.close();
        res.status(500).json({ error: "Error interno del servidor" });
      });

      connection.execSql(request);
    }
  });
}

module.exports = {
  loginUser,
};
