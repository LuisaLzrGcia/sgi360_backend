const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const config = require("../database/dbConfig");
const { Connection } = require("tedious");

function getDocuments(req, res) {
  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    } else {
      const request = new Request(
        "SELECT * FROM [dbo].[document_process] order by code ASC;",
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
function getDocumentsByProcess(req, res) {
  const processName = req.params.process;
  const type = req.params.type;
  const status = req.params.status;
  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    } else {
      let whereClause = "process_name = @processName";
      if (type != "Todos") {
        whereClause += " AND type = @type";
      }
      if (status != "Todos") {
        whereClause += " AND status = @status";
      }
      const request = new Request(
        `SELECT * FROM [dbo].[document_process] WHERE ${whereClause} ORDER BY code ASC;`,
        (err) => {
          if (err) {
            connection.close();
            res.status(500).json({ error: "Error interno del servidor" });
            return;
          }
        }
      );
      request.addParameter("processName", TYPES.VarChar, processName);
      if (type !== "Todos") {
        request.addParameter("type", TYPES.VarChar, type);
      }
      if (status !== "Todos") {
        request.addParameter("status", TYPES.VarChar, status);
      }

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

async function createDocument(req, res) {
  const newDocument = req.body;
  const connection = new Connection(config);
  connection.connect();
  let responseSent = false;
  connection.on("connect", function (err) {
    if (err) {
      connection.close();
      if (!responseSent) {
        res.status(500).json({ error: "Error interno del servidor" });
        responseSent = true;
      }
      return;
    } else {
      const request = new Request(
        `INSERT INTO [dbo].[documents] (type, code, title, reviewer, autorizer, issuance_date, days, id_process_fk)
          VALUES (@type, @code, @title, @reviewer, @autorizer, @issuance_date, @days, @id_process_fk);
          `,
        function (err) {
          if (err) {
            connection.close();
            if (!responseSent) {
              res.status(500).json({ error: "Error interno del servidor" });
              responseSent = true;
            }
            return;
          }
        }
      );

      request.addParameter("type", TYPES.VarChar, newDocument.newType);
      request.addParameter("code", TYPES.VarChar, newDocument.newCode);
      request.addParameter("title", TYPES.VarChar, newDocument.newTitle);
      request.addParameter("reviewer", TYPES.VarChar, newDocument.newReviewer);
      request.addParameter(
        "autorizer",
        TYPES.VarChar,
        newDocument.newAutorizer
      );
      request.addParameter(
        "issuance_date",
        TYPES.Date,
        newDocument.newIssuanceDate
      );
      request.addParameter("days", TYPES.Int, newDocument.newDays);
      request.addParameter("id_process_fk", TYPES.Int, newDocument.newProcess);

      request.on("row", function (columns) {
        columns.forEach(function (column) {
          if (column.value === null) {
            console.log("NULL");
          } else {
            console.log("document inserted " + column.value);
          }
        });
      });
      request.on("requestCompleted", function (rowCount, more) {
        connection.close();
        if (!responseSent) {
          res.status(201).send({ status: "Successfully" });
          responseSent = true;
        }
        return;
      });
      connection.execSql(request);
    }
  });
}

async function updateDocument(req, res) {
  const updatedDocument = req.body;
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
        UPDATE [dbo].[documents]
        SET 
          type = @newType,
          code = @newCode,
          title = @newTitle,
          reviewer = @newReviewer,
          autorizer = @newAutorizer,
          issuance_date = @newIssuanceDate,
          days = @newDays,
          id_process_fk = @newProcess
        WHERE
          id_document_pk = @idDocument;

        `,
        function (err) {
          if (err) {
            connection.close();
            return;
          }
        }
      );
      request.addParameter("newType", TYPES.VarChar, updatedDocument.newType);
      request.addParameter("newCode", TYPES.VarChar, updatedDocument.newCode);
      request.addParameter("newTitle", TYPES.VarChar, updatedDocument.newTitle);
      request.addParameter(
        "newReviewer",
        TYPES.VarChar,
        updatedDocument.newReviewer
      );
      request.addParameter(
        "newAutorizer",
        TYPES.VarChar,
        updatedDocument.newAutorizer
      );
      request.addParameter(
        "newIssuanceDate",
        TYPES.Date,
        updatedDocument.newIssuanceDate
      );
      request.addParameter("newDays", TYPES.Int, updatedDocument.newDays);
      request.addParameter("newProcess", TYPES.Int, updatedDocument.newProcess);
      request.addParameter("idDocument", TYPES.Int, updatedDocument.idDocument);

      request.on("requestCompleted", function (rowCount, more) {
        connection.close();
        res.status(201).send({ status: "Successfully" });
        return;
      });
      connection.execSql(request);
    }
  });
}

async function deleteDocument(req, res) {
  const idDocument = req.params.id;
  const connection = new Connection(config);
  connection.connect();
  connection.on("connect", function (err) {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    } else {
      const request = new Request(
        `DELETE FROM [dbo].[documents] WHERE id_document_pk = @idDocument`,
        function (err) {
          if (err) {
            connection.close();
            res.status(500).json({ error: "Error interno del servidor" });
            return;
          }
        }
      );
      request.addParameter("idDocument", TYPES.Int, idDocument);
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
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocumentsByProcess,
};
