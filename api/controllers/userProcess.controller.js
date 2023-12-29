const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const config = require("../database/dbConfig");
const { Connection } = require("tedious");

function getProcess(req, res) {
  const process = req.params.process;
  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      res.status(500).json({ error: "Error interno del servidor" });
      connection.close();
    } else {
      const request = new Request(
        "SELECT TOP 1 * FROM [dbo].[user_process] WHERE process_name = @processName;",
        (err) => {
          if (err) {
            console.error(err);
            connection.close();
          }
        }
      );
      request.addParameter("processName", TYPES.NVarChar, process);
      let foundResult = false;
      let result = null;

      request.on("row", (columns) => {
        if (!foundResult) {
          result = {};
          columns.forEach((column) => {
            result[column.metadata.colName] =
              column.value === null ? null : column.value.toString();
          });
          foundResult = true;
        }
      });

      request.on("requestCompleted", (rowCount, more) => {
        connection.close();
        if (foundResult) {
          res.status(200).json(result);
        } else {
          res.status(404).json({ error: "No se encontraron resultados" });
        }
      });

      connection.execSql(request);
    }
  });
}

module.exports = {
  getProcess,
};
