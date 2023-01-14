import * as fs from 'fs'
import path from 'path'
import {datasets} from "./datasets.js";

import sqlite3 from 'sqlite3'

const __dirname = path.resolve()

export const dbPath = path.resolve(__dirname, `./db/`)
export const dbFile = path.resolve(dbPath, 'sensors.sqlite3')

const dbSensors = new sqlite3.Database(dbFile,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
    if (err) {
        console.log(err)
    }

    console.log (`Connected to the in-memory SQlite database ${dbFile}`)
})

export const createSensorsTable = () => {
    dbSensors.serialize(() => {
        // dbSensors.run("DROP TABLE if exists sensors")
        const sql = 'CREATE TABLE if not exists sensors ('
            + 'id INTEGER PRIMARY KEY AUTOINCREMENT, '
            + 'timestamp INTEGER, '
            + 'experiment INTEGER, '
            + 'point INTEGER, '
            + 'sensor INTEGER, '
            + 'status INTEGER, '
            + 'temperature REAL, '
            + 'humidity REAL)'
        dbSensors.run(sql);
        // dbSensors.run("DELETE FROM sensors")
    })
}

export const fillDefaultDatasetConfig = () => {
    dbSensors.serialize(() => {
        const sql  = 'INSERT OR IGNORE INTO dataset_config (sensor, column, type, enabled, label, borderColor, backgroundColor) VALUES (?, ?, ?, ?, ?, ?, ?)'
        const stmt = dbSensors.prepare(sql)
        datasets.forEach((dataset, idx) => {
            stmt.run (
                dataset.sensor,
                dataset.column,
                dataset.type,
                dataset.enabled,
                dataset.label,
                dataset.borderColor,
                dataset.backgroundColor
            )
        })
    })
}

export const createDatasetConfigTable = () => {
    dbSensors.serialize(() => {
        // dbSensors.run("DROP TABLE if exists dataset_config")
        const sql = 'CREATE TABLE if not exists dataset_config ('
            + 'sensor INTEGER, '
            + 'column CHAR(12), '
            + 'type CHAR(12), '
            + 'enabled INTEGER, '
            + 'label TEXT, '
            + 'borderColor TEXT, '
            + 'backgroundColor TEXT, '
            + 'PRIMARY KEY (sensor, column),'
            + 'UNIQUE (sensor, column)'
            + ')'
        dbSensors.run(sql);
    })

    fillDefaultDatasetConfig()
}

export const createStorage = () => {
    console.log(`createStorage: ${dbPath}`)
    try {
        // Query the entry
        const stats = fs.lstatSync(dbPath);
        console.log('stats', stats)
        // Is it a directory?
        if (stats.isDirectory()) {
            console.log(stats)
        }
    }
    catch (e) {
        // ...
    }

    dbPath.split('/').reduce(
        (directories, directory) => {
            directories += `${directory}/`

            if (!fs.existsSync(directories)) {
                fs.mkdirSync(directories)
            }

            return directories;
        },
        '',
    )

    createSensorsTable ()
    createDatasetConfigTable  ()
}

export const writeSensors = (sensors) => {
    const sql = 'INSERT INTO sensors (timestamp, experiment, point, sensor, status, temperature, humidity) VALUES (?,?,?,?,?,?,?)'
    dbSensors.serialize(() => {
        const stmt = dbSensors.prepare(sql)
        sensors.forEach( sensor => {
            // console.log(new Date(sensor.timestamp * 1000))
            stmt.run(
                Number.parseInt(sensor.timestamp),
                Number.parseInt(sensor.experiment),
                Number.parseInt(sensor.point),
                Number.parseInt(sensor.sensor),
                Number.parseInt(sensor.status),
                Number.parseFloat(sensor.temperature),
                Number.parseFloat(sensor.humidity))
        })
        stmt.finalize()
    })
}

export const readDatasets = (params) => {
    return new Promise((resolve, reject) => {
            dbSensors.serialize(() => {
            const sql = 'SELECT * FROM '
                + `(SELECT * from sensors WHERE sensor = ${params.sensor} `
                + `ORDER BY id DESC LIMIT ${params.counter})`
                + 'ORDER BY id ASC'
            // console.log(sql)
            dbSensors.all(sql, [], (err, rows) => {
                if (err) reject(err)
                else resolve(rows)
            })
        })
    })
}

export const readDatasetConfig = (params) => {
    return new Promise((resolve, reject) => {
        dbSensors.serialize(() => {
            const sql = 'SELECT * FROM dataset_config'
            dbSensors.all(sql, [], (err, rows) => {
                if (err) reject (err)
                else {
                    resolve (rows)
                }
            })
        })
    })
}

export const writeDatasetConfig = (dataset) => {
    return new Promise((resolve, reject) => {
        dbSensors.serialize(() => {
            const sql = 'UPDATE dataset_config SET enabled = ?, type = ?, label = ?, borderColor = ?, backgroundColor = ? WHERE sensor = ? AND column = ?'
            const stmt = dbSensors.prepare(sql, err => {
                if (err) {
                    reject({result: 'error', error: err})
                }
            })

            stmt.run(
                dataset.enabled,
                dataset.type,
                dataset.label,
                dataset.borderColor,
                dataset.backgroundColor,
                dataset.sensor,
                dataset.column
            )

            stmt.finalize((err) => {
                if (err) reject ({result: 'error', error: err})
                else resolve({result: 'ok'})
            })
        })
    })
}

createStorage()
