import mysql2 from "mysql2"
import {config} from 'dotenv'
config()

// export const db = mysql2.createPool({
//   host: process.env.HOST,
//   user: process.env.USER,
//   password: process.env.PASSWORD,
//   database: process.env.DATABASE,
//   port: process.env.DB_PORT,
// })

export const db = mysql2.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "70998513Daniel",
  database: "blog",
  port: 3306,
})

// USER = root
// HOST = 127.0.0.1
// PASSWORD = 70998513Daniel
// DATABASE = blog
// DB_PORT = 3306