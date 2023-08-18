const { version } = require("../package.json");

const swaggerDef = {
  openapi: "3.0.0",
  info: {
    title: "Playmos Backend",
    version,
  },
  components: {
    securitySchemes: {
      Authorization: {
        type: "apiKey",
        in: "header",
        name: "Authorization",
      },
    },
  },
  security: [
    {
      Authorization: [],
    },
  ],
  servers: [
    {
      url: `http://localhost:${process.env.PORT}/api/v1`,
    },
  ],
};

module.exports = swaggerDef;
