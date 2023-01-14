import {Router} from 'express'
import {
    getDatasetConfig,
    getHumidityDataset,
    setDatasetConfig,
    getConfig, setConfig,
} from '../controllers/humidity.js'

const router = Router ()

router.post('/api/dataset', getHumidityDataset)
router.get('/api/dataset', getHumidityDataset)
router.post('/api/dataset_config', getDatasetConfig)
router.get('/api/dataset_config', getDatasetConfig)
router.post('/api/set_dataset_config', setDatasetConfig)
router.get('/api/set_dataset_config', setDatasetConfig)
router.post('/api/config', getConfig)
router.get('/api/config', getConfig)
router.post('/api/set_config', setConfig)
router.get('/api/set_config', setConfig)

export default router