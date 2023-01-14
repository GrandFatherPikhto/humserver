import {YandexDisk} from "yandex-disk"
import {dbFile} from "./sensorsdb.js"

const oauthToken = 'y0_AgAAAAAK7LzrAATuwQAAAADZqEpGGTQvTGOXSgeikSlUTIX3E3Y8wZ0'

const yaDisk = new YandexDisk(oauthToken)

export const uploadDatabaseFile = () => {
    const outFileName = new Date().toLocaleString()
    yaDisk.uploadFile(dbFile, `/humidity/${outFileName}.sqlite3`, (err) => {
        console.log(err)
    })
}
