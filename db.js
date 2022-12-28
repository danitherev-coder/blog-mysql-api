import mysql2 from "mysql2"
import {config} from 'dotenv'
config()

export const db = mysql2.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DB_PORT,
})
