import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
// this is a top-level await 
export default async(room, contact, content, date) => {
    // open the database
    const db = await open({
      filename: './chat-message.db',
      driver: sqlite3.Database
    })
    await db.run('insert into msg(room,contact,content,date) values(?,?,?,?)',
    room, contact, content, date)
}