import { SerialPort, DelimiterParser, ReadlineParser } from 'serialport'
import { autoDetect, WindowsBinding } from '@serialport/bindings-cpp'
import {writeSensors} from "./sensorsdb.js"

import * as fs from 'fs'
import path from 'path'

const vendorId  = '10C4'
const productId = 'EA60'
const pntId     =  'USB\\VID_10C4&PID_EA60\\0001'

const __dirname = path.resolve()

const parser = new ReadlineParser()

export let serialPort = null
export let portInfo   = null
export const hihData  = []

let startDateTime   = new Date()
let currentDateTime = new Date()
let logFileName = 'test.csv'

const dateTimeString = (datetime) => {
    return new Intl.DateTimeFormat(
        'ru-RU',
        {
            dateStyle: 'short',
            timeStyle: 'long',
            timeZone: 'Europe/Moscow'
        }).format(datetime)
}


const getLogFileName = (datetime) => {
    const lfname = datetime.getDate().toString().padStart(2, '0')
        + datetime.getMonth().toString().padStart(2, '0')
        + datetime.getFullYear().toString() + '_'
        + datetime.getHours().toString().padStart(2, '0')
        + datetime.getMinutes().toString().padStart(2, '0') + '.csv'
    return path.resolve(__dirname, `./static/log/${lfname}`)
}

const writeLogHeader = () => {
    const content = 'Date/Time; UTC; Point Number; Sensor Number; Humidity %; Temperature °C;\n'
    fs.appendFile(logFileName, content, err => {
        if (err) {
            console.error(err)
        }
    })
}

const writeLog = (data) => {
    const date = new Date(Number.parseInt(data.timestamp) * 1000)
    const content =
        dateTimeString(date) + '; '
        + data.timestamp.toString() + '; '
        + data.experiment.toString() + '; '
        + data.point.toString() + '; '
        + data.status.toString() + '; '
        + data.sensor.toString() + '; '
        + data.humidity.toString() + '; '
        + data.temperature.toString() + ';\n'
    fs.appendFile(logFileName, content, err => {
        if (err) {
            console.error(err)
        }
    })
}

export const startRead = () => {
    if (serialPort === null) {
        SerialPort.list().then(portsInfo => {
            portsInfo.forEach( portInfo => {
                if (portInfo.vendorId     !== undefined
                    && portInfo.productId !== undefined
                    && portInfo.vendorId.toUpperCase()  === vendorId
                    && portInfo.productId.toUpperCase() === productId) {

                    serialPort = new SerialPort({ path: portInfo.path, baudRate: 115200 })
                    logFileName = getLogFileName(startDateTime)
                    writeLogHeader()
                    serialPort.pipe(parser)

                    serialPort.on('error', err => {
                        console.log(err)
                    })

                    let sensors = []
                    parser.on('data', data => {
                        const str = data.toString()
                        // console.log(str)
                        if (str.startsWith("JSON:\t")) {
                            try {
                                // console.log(str.substring(6))
                                const sensor = JSON.parse(str.substring(6))
                                sensors.push(sensor)
                                // writeLog(sensor)
                                if (Number.parseInt(sensor.sensor) === 7) {
                                    hihData.push(sensors)
                                    writeSensors(sensors)
                                    sensors = []
                                }
                            } catch (e) {
                                console.log(e)
                            }
                        }
                    })

                    serialPort.on('open', () => {
                        console.log(`Port ${serialPort.path} is opened. Start reading data`)
                    })
                }
            })
        })
    }
}


export const  stopRead = () => {
    if (serialPort !== null && serialPort.isOpen) {
        serialPort.close()
        serialPort.on('close', () => {
            console.log(`Port ${serialPort.path} is closed`)
            serialPort = null
        })
    }
}

export const startReadingData = (arg) => {
    if (serialPort === null) {
        startRead()
    } else if (!serialPort.isOpen) {
        serialPort = null
        startRead()
    }
}

setInterval(startReadingData, 2000, 'startReadingData')
