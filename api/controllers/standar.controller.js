const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const config = require("../database/dbConfig");
const { Connection } = require("tedious");

// Función para obtener registros de la tabla "standar"
function getStandar(req, res) {
  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    } else {
      const request = new Request(
        "SELECT * FROM [dbo].[standar] ORDER BY name ASC;",
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

// Función para crear un registro en la tabla "standar"
async function createStandar(req, res) {
  const newStandar = req.body;
  const connection = new Connection(config);
  connection.connect();
  connection.on("connect", function (err) {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      throw err;
    } else {
      const request = new Request(
        `INSERT INTO [dbo].[standar] (name, description)
        VALUES (@name, @description);
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
      request.addParameter("name", TYPES.NVarChar, newStandar.name);
      request.addParameter("description", TYPES.NVarChar, newStandar.description);

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

// Función para actualizar un registro en la tabla "standar"
async function updateStandar(req, res) {
  const updatedStandar = req.body;
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
        UPDATE [dbo].[standar]
        SET name = @name, description = @description
        WHERE id_standar_pk = @idStandar
        `,
        function (err) {
          if (err) {
            connection.close();
            return;
          }
        }
      );
      request.addParameter("name", TYPES.NVarChar, updatedStandar.name);
      request.addParameter("description", TYPES.NVarChar, updatedStandar.description);
      request.addParameter("idStandar", TYPES.Int, updatedStandar.idStandar);

      request.on("requestCompleted", function (rowCount, more) {
        connection.close();
        res.status(201).send({ status: "Successfully" });
        return;
      });
      connection.execSql(request);
    }
  });
}

// Función para eliminar un registro en la tabla "standar"
async function deleteStandar(req, res) {
  const idStandar = req.params.id;
  console.log(idStandar)
  const connection = new Connection(config);
  connection.connect();
  connection.on("connect", function (err) {
    if (err) {
      connection.close
      res.status(500).json({ error: "Error interno del servidor" });
      return
    } else {
      const request = new Request(
        `DELETE FROM [dbo].[standar] WHERE id_standar_pk = @idStandar`,
        function (err) {
          if (err) {
            connection.close();
            res.status(500).json({ error: "Error interno del servidor" });
            return;
          }
        }
      );
      request.addParameter("idStandar", TYPES.Int, idStandar);
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
  getStandar,
  createStandar,
  updateStandar,
  deleteStandar,
};
