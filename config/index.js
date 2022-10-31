require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.BASE_URL || "http://localhost",
  },
  database: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "pagalu",
    charset: 'utf8mb4_general_ci'
  },
  telegram: {
    api: process.env.TG_BOT_API || "",
  }
}