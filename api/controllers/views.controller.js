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
      const request = new Request(
        "SELECT * FROM [dbo].[user_process];",
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
        connection.close();
        res.status(200).json(results);
        return;
      });
      connection.execSql(request);
    }
  });
}

function getObjetiveByProcess(req, res) {
  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      res.status(500).json({ error: "Error interno del servidor" });
      connection.close();
    } else {
      const process = req.params.process;
      const year = req.params.year;

      const request = new Request(
        `exec GetObjectiveStatusByMonth '${process}', ${year}`,
        (err) => {
          if (err) {
            connection.close();
            res.status(500).json({ error: "Error interno del servidor" });
            return;
          }
        }
      );

      request.addParameter("process", TYPES.NVarChar, process);
      request.addParameter("year", TYPES.Int, year);
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

function getObjetiveCurrentByProcess(req, res) {
  const connection = new Connection(config);

  connection.connect((err) => {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    } else {
      const process = req.params.process;
      const year = req.params.year;

      const request = new Request(
        `exec GetObjectiveCurrentByMonth '${process}', ${year}`,
        (err) => {
          if (err) {
            connection.close();
            res.status(500).json({ error: "Error interno del servidor" });
            return;
          }
        }
      );

      request.addParameter("process", TYPES.NVarChar, process);
      request.addParameter("year", TYPES.Int, year);

      let results = [];

      request.on("row", (columns) => {
        const result = {};
        columns.forEach((column) => {
          result[column.metadata.colName] =
            column.value === null ? null : column.value.toString();
        });
        results.push(result);
      });

      request.on("error", (err) => {
        connection.close();
        res.status(500).json({ error: "Error interno del servidor" });
        throw err;
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

module.exports = {
  userProcess,
  getObjetiveByProcess,
  getObjetiveCurrentByProcess,
};
