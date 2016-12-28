import DB from './modules/db';
import HardwareService from './modules/hardwareService'
import WebService from './modules/webService'

DB.configure(function(initialData){
    HardwareService.init(initialData);
    WebService.runWebserver();
});





















