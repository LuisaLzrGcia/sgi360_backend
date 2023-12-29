const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const config = require("../database/dbConfig");
const { Connection } = require("tedious");

function getObjetive(req, res) {
  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    } else {
      const month = req.params.month;
      const year = req.params.year;
      const process = req.params.process;

      const request = new Request(
        `SELECT * FROM [dbo].[ObjectiveByProcess] 
           WHERE id_month_fk = @month 
             AND year = @year 
             AND process_name = @process;`,
        (err) => {
          if (err) {
            connection.close();
            res.status(500).json({ error: "Error interno del servidor" });
            return;
          }
        }
      );

      request.addParameter("month", TYPES.Int, month);
      request.addParameter("year", TYPES.Int, year);
      request.addParameter("process", TYPES.NVarChar, process); 

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

async function createObjetive(req, res) {
  const newObjetives = req.body;
  const connection = new Connection(config);
  connection.connect();

  connection.on("connect", async function (err) {
    if (err) {
      connection.close();
      res.status(500).json({ error: "Error interno del servidor" });
      throw err;
    } else {
      try {
        for (const newObjetive of newObjetives) {
          for (let month = 1; month <= 12; month++) {
            await new Promise((resolve, reject) => {
              const request = new Request(
                `
                INSERT INTO [dbo].[objetive]
                  (perspective, application, objective, expected, id_month_fk, year, id_process_fk,
                  measurement, consult, initialValue, finalValue, date, frequency, who, communicate)
                VALUES
                  (@perspective, @application, @objective, @expected, @idMonth, @year, @idProcess,
                  @measurement, @consult, @initialValue, @finalValue, @date, @frequency, @who, @communicate);
                `,
                function (err) {
                  if (err) {
                    console.log(err);
                    reject(err);
                    return;
                  }
                }
              );

              request.addParameter(
                "perspective",
                TYPES.NVarChar,
                newObjetive.perspective
              );
              request.addParameter(
                "application",
                TYPES.NVarChar,
                newObjetive.application
              );
              request.addParameter(
                "objective",
                TYPES.NVarChar,
                newObjetive.objective
              );
              request.addParameter(
                "expected",
                TYPES.NVarChar,
                newObjetive.expected
              );
              request.addParameter("idMonth", TYPES.Int, month);
              request.addParameter("year", TYPES.Int, newObjetive.year);
              request.addParameter(
                "idProcess",
                TYPES.Int,
                newObjetive.idProcess
              );
              request.addParameter(
                "measurement",
                TYPES.NVarChar,
                newObjetive.measurement
              );
              request.addParameter(
                "consult",
                TYPES.NVarChar,
                newObjetive.consult
              );
              request.addParameter(
                "initialValue",
                TYPES.NVarChar,
                newObjetive.initialValue
              );
              request.addParameter(
                "finalValue",
                TYPES.NVarChar,
                newObjetive.finalValue
              );
              request.addParameter("date", TYPES.NVarChar, newObjetive.date);
              request.addParameter(
                "frequency",
                TYPES.NVarChar,
                newObjetive.frequency
              );
              request.addParameter("who", TYPES.NVarChar, newObjetive.who);
              request.addParameter(
                "communicate",
                TYPES.NVarChar,
                newObjetive.communicate
              );

              request.on("row", function (columns) {
                columns.forEach(function (column) {
                  if (column.value === null) {
                    console.log("NULL");
                  } else {
                    console.log("objetive inserted " + column.value);
                  }
                });
              });

              request.on("requestCompleted", function (rowCount, more) {
                resolve();
              });

              connection.execSql(request);
            });
          }
        }
        connection.close();
        res.status(201).send({ status: "Successfully" });
      } catch (error) {
        console.error(error);
        connection.close();
        res.status(500).json({ error: "Error interno del servidor" });
      }
    }
  });
}

async function updateObjetive(req, res) {
  const updatedObjetive = req.body;
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
        UPDATE [dbo].[objetive]
        SET perspective = @newPerspective, 
            application = @newApplication, 
            objective = @newObjective,
            expected = @newExpected,
            measurement = @measurement,
            consult = @consult,
            initialValue = @initialValue,
            finalValue = @finalValue,
            date = @date,
            frequency = @frequency,
            who = @who,
            communicate = @communicate
        WHERE id_objetive_pk = @idObjetive
        `,
        function (err) {
          if (err) {
            connection.close();
            return;
          }
        }
      );
      request.addParameter(
        "newPerspective",
        TYPES.NVarChar,
        updatedObjetive.newPerspective
      );
      request.addParameter(
        "newApplication",
        TYPES.NVarChar,
        updatedObjetive.newApplication
      );
      request.addParameter(
        "newObjective",
        TYPES.NVarChar,
        updatedObjetive.newObjective
      );
      request.addParameter(
        "newExpected",
        TYPES.NVarChar,
        updatedObjetive.newExpected
      );
      request.addParameter(
        "measurement",
        TYPES.NVarChar,
        updatedObjetive.measurement
      );
      request.addParameter("consult", TYPES.NVarChar, updatedObjetive.consult);
      request.addParameter(
        "initialValue",
        TYPES.NVarChar,
        updatedObjetive.initialValue
      );
      request.addParameter(
        "finalValue",
        TYPES.NVarChar,
        updatedObjetive.finalValue
      );
      request.addParameter("date", TYPES.NVarChar, updatedObjetive.date);
      request.addParameter(
        "frequency",
        TYPES.NVarChar,
        updatedObjetive.frequency
      );
      request.addParameter("who", TYPES.NVarChar, updatedObjetive.who);
      request.addParameter(
        "communicate",
        TYPES.NVarChar,
        updatedObjetive.communicate
      );

      request.addParameter("idObjetive", TYPES.Int, updatedObjetive.idObjetive);
      request.on("requestCompleted", (rowCount, more) => {
        connection.close();
        res.status(201).json({ status: "Successfully" });
      });

      connection.execSql(request);
    }
  });
}

async function deleteObjetive(req, res) {
  const idObjetive = req.params.id;
  const connection = new Connection(config);
  connection.connect();
  connection.on("connect", function (err) {
    if (err) {
      connection.close;
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    } else {
      const request = new Request(
        `DELETE FROM [dbo].[objetive] WHERE id_objetive_pk = @idObjetive`,
        function (err) {
          if (err) {
            connection.close();
            res.status(500).json({ error: "Error interno del servidor" });
            return;
          }
        }
      );
      request.addParameter("idObjetive", TYPES.Int, idObjetive);
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

async function updateAchievement(req, res) {
  const updatedObjetive = req.body;
  const connection = new Connection(config);
  connection.connect();
  connection.on("connect", function (err) {
    if (err) {
      connection.close;
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    } else {
      const request = new Request(
        `
          UPDATE [dbo].[objetive]
          SET [current] = @newCurrent, achievement = @newAchievement
          WHERE id_objetive_pk = @idObjetive
        `,
        function (err) {
          if (err) {
            connection.close();
            reject(err);
            return;
          }
        }
      );

      request.addParameter(
        "newCurrent",
        TYPES.NVarChar,
        updatedObjetive.newCurrent
      );
      request.addParameter(
        "newAchievement",
        TYPES.Float,
        updatedObjetive.newAchievement
      );
      request.addParameter("idObjetive", TYPES.Int, updatedObjetive.idObjetive);

      request.on("requestCompleted", function (rowCount, more) {
        connection.close();
        res.status(201).send({ status: "Successfully" });
        return;
      });

      request.on("error", function (err) {
        connection.close();
        res.status(500).json({ error: "Error interno del servidor" });
        reject(err);
      });

      connection.execSql(request);
    }
  });
}

module.exports = {
  getObjetive,
  createObjetive,
  updateObjetive,
  deleteObjetive,
  updateAchievement,
};
