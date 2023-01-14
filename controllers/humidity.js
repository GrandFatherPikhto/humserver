import assert from 'assert'
import { parse } from 'csv-parse'
import path from 'path'
import {json} from 'express'
import * as fs from 'fs'
import humidity from "../routes/humidity.js"
import {startRead, stopRead, hihData } from "../data/serial.js"
import {readDatasetConfig, readDatasets, writeDatasetConfig} from "../data/sensorsdb.js";
import {readConfig, writeConfig} from "../data/config.js";

const __dirname = path.resolve()

const humidityData = []
const sensorsNum = 10
const generatorInterval = 5000
let counter = 0
let dataGeneratorId = null
let position = 0

const generateSensorData = () => {
    let sensor = 0

    const len = sensorsNum * (counter + 1)

    for (sensor = 0; sensor < sensorsNum; sensor ++) {
        const num = counter * sensorsNum + sensor

    }
    counter ++
}

export const getHumidityDataset = (req, res) => {
    const params = req.body
    readDatasets(params).then((dataset) => {
        // console.log(dataset.map(sensor => { return sensor.point }))
        res.status(200).json(dataset.map((data, idx) => {
            data.idx = idx
            return data
        }))
    }).catch((err) => {
        console.log(err)
        res.status(204)
    })
}

export const getDatasetConfig = (req, res) => {
    const params = req.body
    readDatasetConfig(params).then((config) => {
        res.status(200).json(config)
    }).catch((err) => {
        res.status(204)
    })
}

export const setDatasetConfig = (req, res) => {
    const params = req.body
    writeDatasetConfig(params).then(reply => {
        res.status(200).json(reply)
    }).catch(err => {
        res.status(200).json(err)
    })
}

export const getConfig = (req, res) => {
    const params = req.body
    readConfig().then((config) => {
        res.status(200).json(config)
    }).catch(err => {
        res.status({status: 'error', error: err})
    })
}

export const setConfig = (req, res) => {
    const params = req.body
    writeConfig(params).then((reply) => {
        res.status(200).json(reply)
    }).catch((reply) => {
        res.status(200).json(reply)
    })
}