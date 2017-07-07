import DB from './modules/Database';
import HardwareService from './modules/HardwareService'
import WebService from './modules/WebService'

DB.configure(function(initialData){
    HardwareService.init(initialData);
    WebService.runWebserver();
});


















