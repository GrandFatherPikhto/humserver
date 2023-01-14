import {updateCharts, resetReadingData, startReadingData} from "./chart.js"
import {postData} from "./jsondata.js";
import {config} from "./config.js"

const urlWriteDatasetConfig = '/api/set_dataset_config'
const urlReadDatasetConfig  = 'http://localhost:3000/api/dataset_config'
const urlWriteConfig        = '/api/set_config'
const urlReadConfig         = '/api/config'

export const datasets = []

const executeOptions = () => {
    const showOptions = document.getElementById('show-options')
    const options = document.getElementById('options')
    // console.log('Open/Close options event', options)
    showOptions.addEventListener('click', (event) => {
        if (options.style.display === 'none') {
            options.style.display = 'block'
        } else {
            options.style.display = 'none'
        }
    })
}

const createSensorCell = (row, sensor, idx) => {
    const cell  = document.createElement('div')
    const input = document.createElement('input')
    input.setAttribute('type', 'checkbox')
    cell.setAttribute('class', 'flex-row')
    cell.setAttribute('role', 'cell')
    input.setAttribute('id', `${sensor.type}${idx}`)
    input.setAttribute('data-sensor', sensor.sensor)
    input.setAttribute('data-column', sensor.column)
    input.setAttribute('data-idx', idx.toString())
    if(sensor.enabled) {
        input.setAttribute('checked', 'true')
        input.setAttribute('data-enabled', 'true')
    } else {
        input.setAttribute('data-enabled', 'false')
    }

    input.addEventListener('change', (event) => {
        const enabled = event.target.checked
        const idx = event.target.dataset.idx
        datasets[idx].enabled = enabled
        event.target.setAttribute('data-enabled', enabled)
        postData(urlWriteDatasetConfig, datasets[idx])
        updateCharts()
    })

    cell.appendChild(input)
    row.appendChild(cell)
}

const createSensorsEnable = () => {
    // const divSensors = document.getElementById('sensors')
    const rowHumidity = document.getElementById('options-humidity')
    const rowTemperature = document.getElementById('options-temperature')
    datasets.forEach( (sensor, idx) => {
        switch (sensor.column) {
            case 'humidity':
                createSensorCell(rowHumidity, sensor, idx)
                break;
            case 'temperature':
                createSensorCell(rowTemperature, sensor, idx)
                break;
        }
    })
}

const executeNumPoints = () => {
    const numPointsInput = document.getElementById('num-points')
    numPointsInput.value = config.pointNumbers
    numPointsInput.dataset.numbers = config.pointNumbers
    numPointsInput.addEventListener('change', (event) => {
        config.pointNumbers = event.target.value
        updateCharts()
        postData(urlWriteConfig, {pointNumbers: config.pointNumbers}).then((reply) => { console.log(reply)})
    })
}

const executePollingPeriod = () => {
    const pollingPeriod = document.getElementById('polling-period')
    pollingPeriod.value = config.readingDataInterval
    pollingPeriod.addEventListener('change', (event) => {
        config.readingDataInterval = pollingPeriod.value
        resetReadingData()
        startReadingData()
        postData(urlWriteConfig, {readingDataInterval: config.readingDataInterval}).then((reply) => { console.log(reply)})
    })
}

const executePauseButton = () => {
    const pauseButton = document.getElementById('suspend')
    pauseButton.addEventListener('click', (event) => {
        if (event.target.dataset.pause) {
            config.pause = !config.pause
            pauseButton.dataset.pause = config.pause
            pauseButton.innerText = config.pause ? 'Продолжить' : 'Приостановить'
            if (config.pause) {
                resetReadingData()
            } else {
                startReadingData()
            }
            postData(urlWriteConfig, {pause: config.pause}).then((reply) => { console.log(reply)})
        }
    })
}

const readConfig = () => {
    const params = {}
    postData(urlReadConfig, params).then (cfg => {
        if (cfg.pointNumbers) {
            config.pointNumbers = cfg.pointNumbers
        }
        if (cfg.readingDataInterval) {
            config.readingDataInterval = cfg.readingDataInterval
        }
        if (cfg.pause) {
            config.pause = cfg.pause
        }

        executeNumPoints()
        executePollingPeriod()
        executeOptions()
        executePauseButton()
        createSensorsEnable()
    })
}

const readDatasetConfig = () => {
    const params = {}
    postData(urlReadDatasetConfig, params).then( datasetsConfig => {
        while (datasets.length) datasets.pop()
        datasetsConfig.forEach (cfg => {
            datasets.push(cfg)
        })
        readConfig()
    })
}

export const menuInit = () => {
    readDatasetConfig()
}