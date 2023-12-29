const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const config = require("../database/dbConfig");
const { Connection } = require("tedious");

function getAudit(req, res) {
  const filterAudit = req.body;
  if (!filterAudit) {
    res.status(400).json({ error: "Error" });
    return;
  } else {
    if (
      !filterAudit.standar ||
      !filterAudit.type ||
      !filterAudit.year ||
      !filterAudit.status
    ) {
      res.status(400).json({ error: "Todos los campos son obligatorios" });
      return;
    }
    const connection = new Connection(config);
    connection.connect((err) => {
      if (err) {
        connection.close();
        res.status(500).json({ error: "Error interno del servidor" });
        return;
      } else {
        let typeAudit = "";
        if (filterAudit.type !== "Todos") {
          typeAudit = ` AND audit_type='${filterAudit.type}'`;
        }
        let statusAudit = "";
        if (filterAudit.status !== "Todos") {
          statusAudit = ` AND [audit_status]='${filterAudit.status}'`;
        }
        const sqlQuery = `SELECT * FROM [dbo].[standar_audit] 
          where standar_name='${filterAudit.standar}'
          ${typeAudit} 
          AND YEAR(audit_start_date)=${filterAudit.year} 
          ${statusAudit};`;
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
          if (results.length > 0) {
            res.status(200).json(results);
          } else {
            res.status(200).json([]);
          }
          return;
        });
        connection.execSql(request);
      }
    });
  }
}

async function createAudit(req, res) {
  const newAudit = req.body;
  const connection = new Connection(config);
  connection.connect();
  connection.on("connect", function (err) {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      throw err;
    } else {
      const request = new Request(
        `INSERT INTO [dbo].[audit] (code, id_standar_fk, description, start_date, finish_date, type, status)
        VALUES (@code, @idStandar, @description, @startDate, @finishDate, @type, @status);
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
      request.addParameter("code", TYPES.NVarChar, newAudit.code);
      request.addParameter("idStandar", TYPES.Int, newAudit.idStandar);
      request.addParameter("description", TYPES.NVarChar, newAudit.description);
      request.addParameter("startDate", TYPES.Date, newAudit.start_date);
      request.addParameter("finishDate", TYPES.Date, newAudit.finish_date);
      request.addParameter("type", TYPES.NVarChar, newAudit.type);
      request.addParameter("status", TYPES.NVarChar, newAudit.status);

      request.on("row", function (columns) {
        columns.forEach(function (column) {
          if (column.value === null) {
            console.log("NULL");
          } else {
            console.log("audit inserted " + column.value);
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

async function updateAudit(req, res) {
  const updatedAudit = req.body;
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
        UPDATE [dbo].[audit]
        SET code = @code, id_standar_fk = @idStandar, description = @description,
        start_date = @startDate, finish_date = @finishDate, type = @type, status = @status
        WHERE id_audit_pk = @idAudit
        `,
        function (err) {
          if (err) {
            connection.close();
            return;
          }
        }
      );
      request.addParameter("code", TYPES.NVarChar, updatedAudit.code);
      request.addParameter("idStandar", TYPES.Int, updatedAudit.idStandar);
      request.addParameter(
        "description",
        TYPES.NVarChar,
        updatedAudit.description
      );
      request.addParameter("startDate", TYPES.Date, updatedAudit.startDate);
      request.addParameter("finishDate", TYPES.Date, updatedAudit.finishDate);
      request.addParameter("type", TYPES.NVarChar, updatedAudit.type);
      request.addParameter("status", TYPES.NVarChar, updatedAudit.status);
      request.addParameter("idAudit", TYPES.Int, updatedAudit.idAudit);

      request.on("requestCompleted", function (rowCount, more) {
        connection.close();
        res.status(201).send({ status: "Successfully" });
        return;
      });
      connection.execSql(request);
    }
  });
}

async function deleteAudit(req, res) {
  const idAudit = req.params.id;
  console.log(idAudit);
  const connection = new Connection(config);
  connection.connect();
  connection.on("connect", function (err) {
    if (err) {
      connection.close;
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    } else {
      const request = new Request(
        `DELETE FROM [dbo].[audit] WHERE id_audit_pk = @idAudit`,
        function (err) {
          if (err) {
            connection.close();
            res.status(500).json({ error: "Error interno del servidor" });
            return;
          }
        }
      );
      request.addParameter("idAudit", TYPES.Int, idAudit);
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

function getAuditByStandar(req, res) {
  const standar = req.params.standar;
  const year = req.params.year;

  if (!standar) {
    res.status(400).json({ error: "Parámetro 'standar' no proporcionado" });
    return;
  } else {
    if (!year) {
      res.status(400).json({ error: "Parámetro 'year' no proporcionado" });
      return;
    } else {
      const connection = new Connection(config);
      connection.connect((err) => {
        if (err) {
          connection.close();
          res.status(500).json({ error: "Error interno del servidor" });
          return;
        } else {
          const request = new Request(
            `SELECT * FROM standar_audit
            WHERE standar_name='${standar}' AND YEAR(audit_start_date) = ${year}
            ORDER BY audit_code;`,
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
  }
}

module.exports = {
  getAudit,
  createAudit,
  updateAudit,
  deleteAudit,
  getAuditByStandar,
};
