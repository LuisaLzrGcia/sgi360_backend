const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const config = require("../database/dbConfig");
const { Connection } = require("tedious");

function getProcesses(req, res) {
  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    } else {
      const request = new Request(
        "SELECT * FROM [dbo].[process] order by name ASC;",
        (err) => {
          if (err) {
            connection.close();
            res.status(500).json({ error: "Error interno del servidor" });
            return;
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

async function createProcess(req, res) {
  const newProcess = req.body;
  const connection = new Connection(config);
  connection.connect();
  connection.on("connect", function (err) {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      throw err;
    } else {
      const request = new Request(
        `INSERT INTO [dbo].[process] (name, abbreviation, power_bi)
        VALUES (@name, @abbreviation, @power_bi);
        `,
        function (err) {
          if (err) {
            console.log(err);
            connection.close();
            res.status(500).json({ error: "Error interno del servidor" });
            throw err;
          }
        }
      );
      request.addParameter("name", TYPES.VarChar, newProcess.newNameProcess);
      request.addParameter(
        "abbreviation",
        TYPES.VarChar,
        newProcess.newAbbreviation
      );
      request.addParameter(
        "power_bi",
        TYPES.VarChar,
        newProcess.newPowerBI
      );
      request.on("row", function (columns) {
        columns.forEach(function (column) {
          if (column.value === null) {
            console.log("NULL");
          } else {
            console.log("process inserted " + column.value);
          }
        });
      });
      request.on("requestCompleted", function (rowCount, more) {
        connection.close();
        res.status(201).send({ status: "Successfully" });
        return;
      });
      connection.execSql(request);
    }
  });
}

async function updateProcess(req, res) {
  const updatedProcess = req.body;
  const connection = new Connection(config);
  connection.connect();
  connection.on("connect", function (err) {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      throw err;
    } else {
      const request = new Request(
        `
        UPDATE [dbo].[process]
        SET name = @name, abbreviation = @abbreviation, power_bi=@newPowerBI
        WHERE id_process_pk = @processId
        `,
        function (err) {
          if (err) {
            connection.close();
            return;
          }
        }
      );
      request.addParameter(
        "name",
        TYPES.VarChar,
        updatedProcess.newNameProcess
      );
      request.addParameter(
        "abbreviation",
        TYPES.VarChar,
        updatedProcess.newAbbreviation
      );
      request.addParameter(
        "newPowerBI",
        TYPES.VarChar,
        updatedProcess.newPowerBI
      );
      request.addParameter("processId", TYPES.Int, updatedProcess.processId);
      request.on("requestCompleted", function (rowCount, more) {
        connection.close();
        res.status(201).send({ status: "Successfully" });
        return;
      });
      connection.execSql(request);
    }
  });
}

async function deleteProcess(req, res) {
  const idProcess = req.params.id;
  const connection = new Connection(config);
  connection.connect();
  connection.on("connect", function (err) {
    if (err) {
      connection.close
      res.status(500).json({ error: "Error interno del servidor" });
      return
    } else {
      const request = new Request(
        `DELETE FROM [dbo].[process] WHERE id_process_pk = @idProcess`,
        function (err) {
          if (err) {
            connection.close();
            res.status(500).json({ error: "Error interno del servidor" });
            return;
          }
        }
      );
      request.addParameter("idProcess", TYPES.Int, idProcess);
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
  getProcesses,
  createProcess,
  updateProcess,
  deleteProcess,
};
