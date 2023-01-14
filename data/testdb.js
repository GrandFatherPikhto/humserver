import * as fs from 'fs'
import path from 'path'

import sqlite3 from 'sqlite3'

const __dirname = path.resolve()

export const dbPath = path.resolve(__dirname, `./static/db/`)
export const dbFile = path.resolve(dbPath, 'sensors.sqlite3')

const dbSensors = new sqlite3.Database(dbFile,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            console.log(err)
        }

        console.log (`Connected to the in-memory SQlite database ${dbFile}`)
    })


export const readDatasets = (params) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM (SELECT * from sensors WHERE sensor = ${params.sensor} ORDER BY timestamp DESC LIMIT ${params.limit}) ORDER BY timestamp ASC`
        dbSensors.all(sql, [], (err, rows) => {
            if (err) reject(err)
            else resolve(rows)
        })
    })
}

export const calcDataset = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT COUNT(timestamp) from sensors ORDER BY timestamp DESC`
        dbSensors.all(sql, [], (err, rows) => {
            if (err) reject(err)
            else resolve(rows)
        })
    })
}

const testDb = () => {
    readDatasets({limit: 100, sensor: 1}).then((res) => {
        res.forEach((row) => {
            console.log(new Date(row.timestamp * 1000))
        })
    })
}

testDb()
