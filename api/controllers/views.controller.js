const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const config = require("../database/dbConfig");
const { Connection } = require("tedious");

async function userProcess(req, res) {
  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      res.status(500).json({ error: "Error interno del servidor" });
      connection.close();
    } else {
      const request = new Request("SELECT * FROM [dbo].[user_process];", (err) => {
        if (err) {
          console.error(err);
          connection.close();
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
      });
      connection.execSql(request);
    }
  });
}

module.exports = {
  userProcess,
};
