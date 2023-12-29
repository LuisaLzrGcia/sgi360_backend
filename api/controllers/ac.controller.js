const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const config = require("../database/dbConfig");
const { Connection } = require("tedious");

function getSACCode(req, res) {
  const audit = req.params.audit;
  const sac = req.params.sac;
  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      res.status(500).json({ error: "Error interno del servidor" });
      connection.close();
      throw err;
    } else {
      let query = "SELECT * FROM ac_sac WHERE audit_code = @audit ";

      if (sac !== "Todos") {
        query += " AND sac_code = @sac";
      }

      const request = new Request(query, (err) => {
        if (err) {
          console.error(err);
          connection.close();
          return;
        }
      });

      request.addParameter("audit", TYPES.NVarChar, audit);

      if (sac !== "Todos") {
        request.addParameter("sac", TYPES.NVarChar, sac);
      }

      let results = [];
      request.on("row", (columns) => {
        const result = {};
        columns.forEach((column) => {
          result[column.metadata.colName] =
            column.value === null ? null : column.value;
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

function createAC(req, res) {
  const data = req.body;

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      res.status(500).json({ error: "Error interno del servidor" });
      connection.close();
      throw err;
    } else {
      const insertAC = (acData, callback) => {
        const { idSac, description, responsible, status } = acData;
        const request = new Request(
          "INSERT INTO ac (id_sac_fk, description, responsible, status) VALUES (@idSac, @description, @responsible, @status);",
          (err) => {
            if (err) {
              console.error(err);
              callback(err);
            } else {
              callback(null);
            }
          }
        );
        request.addParameter("idSac", TYPES.Int, idSac);
        request.addParameter("description", TYPES.NVarChar, description);
        request.addParameter("responsible", TYPES.NVarChar, responsible);
        request.addParameter("status", TYPES.NVarChar, status);

        connection.execSql(request);
      };

      const insertAllACs = async () => {
        try {
          for (const acData of data) {
            await new Promise((resolve, reject) => {
              insertAC(acData, (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            });
          }
          res.status(201).json({ status: "Successfully" });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Error interno del servidor" });
        } finally {
          connection.close();
        }
      };

      insertAllACs();
    }
  });
}

function updateAC(req, res) {
  const { idAC, newDescription, newResponsible, newStatus } = req.body;
  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      res.status(500).json({ error: "Error interno del servidor" });
      connection.close();
      throw err;
    } else {
      const request = new Request(
        "UPDATE ac SET description = @newDescription, responsible = @newResponsible, status = @newStatus WHERE id_ac_pk = @idAC;",
        (err) => {
          if (err) {
            console.error(err);
            connection.close();
          }
        }
      );

      request.addParameter("idAC", TYPES.Int, idAC);
      request.addParameter("newDescription", TYPES.NVarChar, newDescription);
      request.addParameter("newResponsible", TYPES.NVarChar, newResponsible);
      request.addParameter("newStatus", TYPES.NVarChar, newStatus);

      request.on("requestCompleted", (rowCount, more) => {
        connection.close();
        res.status(201).json({ status: "Successfully" });
      });

      connection.execSql(request);
    }
  });
}

function deleteAC(req, res) {
  const id = req.params.id;
  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      res.status(500).json({ error: "Error interno del servidor" });
      connection.close();
      throw err;
    } else {
      const request = new Request(
        "DELETE FROM ac WHERE id_ac_pk=@id;",
        (err) => {
          if (err) {
            console.error(err);
            connection.close();
          }
        }
      );
      request.addParameter("id", TYPES.Int, id);

      request.on("requestCompleted", (rowCount, more) => {
        connection.close();
        res.status(201).json({ status: "Successfully" });
      });

      connection.execSql(request);
    }
  });
}

module.exports = {
  getSACCode,
  createAC,
  updateAC,
  deleteAC,
};
