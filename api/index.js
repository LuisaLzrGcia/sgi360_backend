const express = require("express");
const app = express();
const cors = require("cors");
const port = 3005;

const userRoutes = require("./routes/user.routes");
const loginRoutes = require("./routes/login.router");
const viewsRoutes = require("./routes/views.routes");
const userProcessRoutes = require("./routes/userProcess.routes");
const processRoutes = require("./routes/process.routes");
const documentsRoutes = require("./routes/documents.routes");
const sacRoutes = require("./routes/sac.routes");
const standarRoutes = require("./routes/standar.routes");
const auditRoutes = require("./routes/audit.routes");
const objectiveRoutes = require("./routes/objective.routes");
const acRoutes = require("./routes/ac.routes");
const perspectiveRoutes = require("./routes/perspective.routes");

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/sgi360/user", userRoutes);
app.use("/sgi360/login", loginRoutes);
app.use("/sgi360/views", viewsRoutes);
app.use("/sgi360/user_process", userProcessRoutes);
app.use("/sgi360/process", processRoutes);
app.use("/sgi360/documents", documentsRoutes);
app.use("/sgi360/sac", sacRoutes);
app.use("/sgi360/standar", standarRoutes);
app.use("/sgi360/audit", auditRoutes);
app.use("/sgi360/objective", objectiveRoutes);
app.use("/sgi360/ac", acRoutes);
app.use("/sgi360/perspective", perspectiveRoutes);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
