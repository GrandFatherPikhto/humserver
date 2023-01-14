import * as fs from 'fs'
import path from 'path'

export const config = {
    readingDataInterval: 6000,
    pause: false,
    pointNumbers: 100
}

const __dirname = path.resolve()

const configFile = path.join(__dirname, '/data/config.json')

export const writeConfig = (configData = {}) => {
    console.log(configData)
    if (configData.readingDataInterval !== undefined) {
        console.log(configData.readingDataInterval)
        config.readingDataInterval = configData.readingDataInterval
    }

    if (configData.pause !== undefined) {
        config.pause = configData.pause
    }

    if (configData.pointNumbers !== undefined) {
        config.pointNumbers = configData.pointNumbers
    }

    return new Promise((resolve, reject) => {
        fs.writeFile(configFile, JSON.stringify(config), [], (err) => {
            if (err) {
                console.log(err)
                reject({result: 'Error', error: err})
            } else {
                resolve({result: 'Ok'})
            }
        })
    })
}

export const readConfig = () => {
    return new Promise((resolve, reject) => {
        fs.access (configFile,fs.constants.F_OK, (err) => {
            if (err) {
                resolve(config)
                writeConfig().catch(err => {
                    console.log(err)
                })
            }  else {
                fs.readFile(configFile, (err, data) => {
                    const jsonData = JSON.parse(data)
                    resolve(jsonData)
                })
            }
        })
    })
}

