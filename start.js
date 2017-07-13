import DB from './modules/Database';
import HardwareService from './modules/HardwareService'
import WebService from './modules/WebService'

DB.configure()
    .then((initialData) => {
        HardwareService.init(initialData);
        WebService.runWebserver();
    })
    .catch(err => {
        console.log(err);
    });


















