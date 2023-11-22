const { Connection } = require("tedious");

const config = {
  server: "DESKTOP-3RMCEU7\\SQLEXPRESS", // Actualízame
  authentication: {
    type: "default",
    options: {
      userName: "admin_sgi360", // Actualízame
      password: "123456789", // Actualízame
    },
  },
  options: {
    port: 1433,
    database: "sgi360_database",
    trustServerCertificate: true,
  },
};

const connection = new Connection(config);

connection.connect();

connection.on("connect", function (err) {
  if (err) {
    console.error("Error al conectar:", err.message);
  }
});

module.exports = config;
