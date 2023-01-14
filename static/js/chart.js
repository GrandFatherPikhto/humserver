import { Chart, registerables } from '/chart.js/dist/chart.mjs'
import {menuInit, datasets} from "./menu.js"
import {postData} from "./jsondata.js"
import {config} from "./config.js"

const ctx = document.getElementById('humidityChart')

let startDateTime = new Date()
let currentDateTime = new Date()
let readTimer = null

Chart.register(...registerables)

const humidityChart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: []
    },
    options: {
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: 'rgb(255, 99, 132)'
                }
            },
            subtitle: {
                display: true,
                font: { weight: 'bold', size: '24pt' },
                text: 'Эксперимент'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        },
    }
})

const dataLoadingProgress = (xEvent) => {
    console.log(`loading ${xEvent.loaded/xEvent.total * 100}%`)
}

const dataLoaded = (xEvent) => {
    console.log(`data loaded ${xEvent.srcElement.status} ${xEvent.srcElement.readyState}`)
    if (xEvent.srcElement.status === 200 && xEvent.srcElement.readyState === 4) {
        const data = JSON.parse(xEvent.srcElement.responseText)
        // console.log(data)
    }
}

const dataLoadingError = (xEvent) => {
    console.log(`loading error: ${xEvent.error.toString()}`)
}

const getDateTimeString = (datetime) => {
    return datetime.getDate().toString().padStart(2, '0') + '/'
        + datetime.getMonth().toString().padStart(2, '0') + '/'
        + datetime.getFullYear().toString() + ' '
        + datetime.getHours().toString().padStart(2, '0') + ':'
        + datetime.getMinutes().toString().padStart(2, '0')
}

const setSubtitle = () => {
    const startStr = getDateTimeString(startDateTime)
    currentDateTime = new Date()
    const currentStr = getDateTimeString(currentDateTime)

    humidityChart.options.plugins.subtitle.text = `Эксперимент ${startStr} - ${currentStr}`

    document.getElementById('startDatetime').innerText = startStr
    document.getElementById('currentDatetime').innerText = currentStr
}

const calcTime = (timestamp) => {
    const time = new Date(Number.parseInt(timestamp) * 1000)
    const hms = time.getHours().toString().padStart(2, '0')
        + ':' + time.getMinutes().toString().padStart(2, '0')
        + ':' + time.getSeconds().toString().padStart(2, '0')
    return hms
}

const readSensorsData = (dataset, counter, from) => {
    const params = {sensor: dataset.sensor, counter: counter, from: from, column: dataset.column}
    postData('http://localhost:3000/api/dataset', params).then( data => {
        const dt = Object.assign({}, dataset)
        delete dt.enabled
        delete dt.column
        delete dt.sensor
        delete dt.type
        const firstPoint = data[0].point
        dt.data = data.filter(point => {
            return point.status === 1
        }).map(point => {
            return point[dataset.column].toString ()
        })

        if (dt.data.length) {
            humidityChart.data.labels = data.map ( point => { return calcTime(point.timestamp)})
            data.map ((sensor, idx) => {

            })
            humidityChart.data.datasets.push(dt)
            humidityChart.update()
        }
    })
}

export const updateCharts = () => {
    setSubtitle()
    humidityChart.data.datasets = []
    humidityChart.data.labels   = []
    datasets.filter(dataset => dataset.enabled).forEach(dataset => {
        readSensorsData(dataset, config.pointNumbers)
    })
}

export const startReadingData = () => {
    readTimer = setInterval(() => {
        updateCharts()
    }, config.readingDataInterval)
}

export const resetReadingData = () => {
    if (readTimer !== null) {
        clearInterval(readTimer)
    }
}

menuInit()
startReadingData()
