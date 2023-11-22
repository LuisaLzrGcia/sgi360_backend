const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const config = require("../database/dbConfig");
const { Connection } = require("tedious");

function getSacRecords(req, res) {
  const { standar, code, process, yearInput, status } = req.body;

  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    } else {
      // Construir la consulta SQL dinámicamente basada en los parámetros recibidos
      let sqlQuery = `
        SELECT * FROM [dbo].[sac_audit]
        WHERE 1=1`;

      if (standar !== "Todos") {
        sqlQuery += ` AND standar_name = '${standar}'`;
      }

      if (code !== "Todos") {
        sqlQuery += ` AND code = '${code}'`;
      }

      if (process !== "Todos") {
        sqlQuery += ` AND process_name = '${process}'`;
      }

      if (yearInput) {
        sqlQuery += ` AND YEAR(audit_start_date) = ${yearInput}`;
      }

      if (status !== "Todos") {
        sqlQuery += ` AND sac_status = '${status}'`;
      }

      sqlQuery += ` ORDER BY audit_start_date ASC;`;

      const request = new Request(sqlQuery, (err) => {
        if (err) {
          connection.close();
          res.status(500).json({ error: "Error interno del servidor" });
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


// Función para crear un registro en la tabla "sac"
async function createSacRecord(req, res) {
  const newSacRecord = req.body;
  const connection = new Connection(config);
  connection.connect();
  connection.on("connect", function (err) {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      throw err;
    } else {
      const request = new Request(
        `INSERT INTO [dbo].[sac] (id_audit_fk, description, status, id_process_fk)
        VALUES (@idAudit, @description, @status, @idProcess);
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
      request.addParameter("idAudit", TYPES.Int, newSacRecord.idAudit);
      request.addParameter(
        "description",
        TYPES.NVarChar,
        newSacRecord.description
      );
      request.addParameter("status", TYPES.NVarChar, newSacRecord.status);
      request.addParameter("idProcess", TYPES.Int, newSacRecord.idProcess);

      request.on("row", function (columns) {
        columns.forEach(function (column) {
          if (column.value === null) {
            console.log("NULL");
          } else {
            console.log("sac record inserted " + column.value);
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

// Función para actualizar un registro en la tabla "sac"
async function updateSacRecord(req, res) {
  const updatedSacRecord = req.body;
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
        UPDATE [dbo].[sac]
        SET description = @description, status = @status, id_process_fk = @idProcess
        WHERE id_sac_pk = @idSac
        `,
        function (err) {
          if (err) {
            connection.close();
            return;
          }
        }
      );
      request.addParameter(
        "description",
        TYPES.NVarChar,
        updatedSacRecord.description
      );
      request.addParameter("status", TYPES.NVarChar, updatedSacRecord.status);
      request.addParameter("idProcess", TYPES.Int, updatedSacRecord.idProcess);
      request.addParameter("idSac", TYPES.Int, updatedSacRecord.idSac);

      request.on("requestCompleted", function (rowCount, more) {
        connection.close();
        res.status(201).send({ status: "Successfully" });
        return;
      });
      connection.execSql(request);
    }
  });
}

// Función para eliminar un registro en la tabla "sac"
async function deleteSacRecord(req, res) {
  const idSac = req.params.id;
  const connection = new Connection(config);
  connection.connect();
  connection.on("connect", function (err) {
    if (err) {
      connection.close;
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    } else {
      const request = new Request(
        `DELETE FROM [dbo].[sac] WHERE id_sac_pk = @idSac`,
        function (err) {
          if (err) {
            connection.close();
            res.status(500).json({ error: "Error interno del servidor" });
            return;
          }
        }
      );
      request.addParameter("idSac", TYPES.Int, idSac);
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


module.exports = {
  getSacRecords,
  createSacRecord,
  updateSacRecord,
  deleteSacRecord,
};
