const readingDataInterval = 6000
const pointNumbers = 100

const printSensorTd = (tr, name, value) => {
    const td = document.createElement('td')
    tr.appendChild(td)
    td.innerText = value
}

const printSensorHead = (trh, title) => {
    const th = document.createElement('td')
    trh.appendChild(th)
    th.innerText = title
}

const printSensorRow = (table, idx, sensor) => {
    const tr = document.createElement('tr')
    table.appendChild(tr)
    printSensorTd(tr, '#', idx)
    printSensorTd(tr, 'point', sensor.point)
    printSensorTd(tr, 'experiment', sensor.experiment)
    printSensorTd(tr, 'Date/Time', sensor.datetime)
    printSensorTd(tr, 'Status', sensor.hexstat)
    printSensorTd(tr, 'Humidity', sensor.humidity)
    printSensorTd(tr, 'Temperature', sensor.temperature)
}

const printSensorTableHead = (table) => {
    const trh   = document.createElement('tr')
    printSensorHead(trh, '№')
    printSensorHead(trh, '№ Точки')
    printSensorHead(trh, '№ Эксперимента')
    printSensorHead(trh, 'Дата/Время')
    printSensorHead(trh, 'Статус')
    printSensorHead(trh, 'Влажность')
    printSensorHead(trh, 'Температура')
    table.appendChild (trh)
}

const printSensorTable = (sensor = 0, data = []) => {
    const container = document.getElementById('container')
    const head = document.createElement('h2')
    head.innerText = `Сенсор №${sensor + 1}`
    container.appendChild(head)
    const table = document.createElement('table')
    container.appendChild(table)
    printSensorTableHead(table)
    data.forEach((sensor, idx) => {
        printSensorRow(table, idx, sensor)
    })
}

// Example POST method implementation:
async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
    return response.json() // parses JSON response into native JavaScript objects
}

const readSensorData = (params) => {
    postData('http://localhost:3000/api/dataset', params).then( data => {
        const processed = data.map((sensor) => {
            const dt = new Date(sensor.timestamp * 1000)
            const datetime = dt.toLocaleString()
            sensor.datetime = datetime
            sensor.hexstat  = '0x' + sensor.status.toString(16).toUpperCase().padStart(2, '0')
            return sensor
        })
        printSensorTable(params.sensor, data)
    })
}

const readSensorsData = () => {
    const container = document.getElementById('container')
    container.innerText = ''
    for (let sensor = 0; sensor < 8; sensor++) {
        readSensorData({sensor: sensor, counter: pointNumbers})
    }
}

const readDataButton = () => {
    const readData = document.getElementById('read-data')
    readData.addEventListener('click', (evt) => {
        readSensorsData()
    })
}

readDataButton()
readSensorsData()