require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const routes = require("./Routes/routes");
const corsMiddleware = require("./Middleware/corsMiddleware");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
const db = require("./Configs/db");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

db();
const app = express();

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation for my application",
    },
    servers: [
      {
        url: `https://api-mtps.onrender.com`,
      },
    ],
  },
  apis: ["./Controllers/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(corsMiddleware);
app.use(
  session({ secret: "your-secret-key", resave: true, saveUninitialized: true })
);
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", routes);
app.use(express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 1212;
app.listen(port, () => {
  console.log(`Server chạy trên http://localhost:${port}`);
});
