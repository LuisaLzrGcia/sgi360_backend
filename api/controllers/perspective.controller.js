const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const config = require("../database/dbConfig");
const { Connection } = require("tedious");

function getPerspectives(req, res) {
  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      res.status(500).json({ error: "Error interno del servidor" });
      connection.close();
      throw err;
    } else {
      const request = new Request("SELECT * FROM perspective ORDER BY perspective asc;", (err) => {
        if (err) {
          console.error(err);
          connection.close();
          return;
        }
      });

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

function createPerspective(req, res) {
  const newPerspective = req.body;
  const connection = new Connection(config);
  connection.connect();
  connection.on("connect", function (err) {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      throw err;
    } else {
      const request = new Request(
        `INSERT INTO [dbo].[perspective] (perspective)
        VALUES (@perspective);
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
      request.addParameter(
        "perspective",
        TYPES.NVarChar,
        newPerspective.perspective
      );

      request.on("row", function (columns) {
        columns.forEach(function (column) {
          if (column.value === null) {
            console.log("NULL");
          } else {
            console.log("standar inserted " + column.value);
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

function updatePerspective(req, res) {
  const { idPerspective, newPerspective } = req.body;
  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      res.status(500).json({ error: "Error interno del servidor" });
      connection.close();
      throw err;
    } else {
      const request = new Request(
        "UPDATE perspective SET perspective = @newPerspective WHERE id_perspective_pk = @idPerspective;",
        (err) => {
          if (err) {
            console.error(err);
            connection.close();
          }
        }
      );

      request.addParameter("idPerspective", TYPES.Int, idPerspective);
      request.addParameter("newPerspective", TYPES.NVarChar, newPerspective);

      request.on("requestCompleted", (rowCount, more) => {
        connection.close();
        res.status(201).json({ status: "Successfully" });
      });

      connection.execSql(request);
    }
  });
}

function deletePerspective(req, res) {
  const id = req.params.id;
  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      res.status(500).json({ error: "Error interno del servidor" });
      connection.close();
      throw err;
    } else {
      const request = new Request(
        "DELETE FROM perspective WHERE id_perspective_pk=@id;",
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
  getPerspectives,
  createPerspective,
  updatePerspective,
  deletePerspective,
};
