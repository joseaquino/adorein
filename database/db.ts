import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import app from '@adonisjs/core/services/app'
import * as schema from '#database/schema'

const sqlite = new Database(app.tmpPath('db.sqlite3'))
export const db = drizzle(sqlite, { schema })