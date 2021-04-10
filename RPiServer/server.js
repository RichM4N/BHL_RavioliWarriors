/*express */
const express = require('express');
const router = express.Router();
const app = express();

/*body parser |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/*local-devices |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
const find = require('local-devices');

/*node fetch ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
const fetch = require('node-fetch');

/*global varaibles ||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
let UpdateInterval = undefined;
let DevicesArr = [];
let KnownIps = [];

/*view engine |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

/*static folder |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
app.use('/resources', express.static('resources'));

/*function definitions ||||||||||||||||||||||||||||||||||||||||||||||||||||*/

const flipSwitch = (ip,response) => {

    fetch(`http://${ip}/flip`)
    .then(res => {
        if(res.ok){
            res.text()
            .then(body => 
                {
                    let state = body.substring(10);
                    for(var i = 0; i < DevicesArr.length; i++)
                    {
                        if(DevicesArr[i].ip == ip)
                        {
                            DevicesArr[i].flipState = state;
                        }
                    }
                    
                    response.write(JSON.stringify({state: state,ip: ip}));
                    response.end();
                });
            }
         });
};

const setName = (name, ip) => {

    fetch(`http://${ip}/setName/${name}`);
    

};

const MonitorNetwork = () => {
    setTimeout(() => {updateNetworkDevices()}, 2000);
};

const updateNetworkDevices = () => {
    
    find().then((devices) => {
        console.table(devices);
        console.table(KnownIps);

        let devicesIpsArr = [];
        let change = 0;

        for(var i = 0; i < devices.length; i++)
        {
            devicesIpsArr.push(devices[i].ip);
            if(KnownIps.indexOf(devices[i].ip) == -1)   
            {
                
                console.log('devices changed');
                change = 1;
            }
        }

        for(var i = 0; i < KnownIps.length; i++)
        {
            
            if(devicesIpsArr.indexOf(KnownIps[i]) == -1)   
            {
                
                console.log('devices changed');
                change = 1;
            }
        }

        if(change == 0)
        {
            let DevicesArrTemp = [...DevicesArr];
            DevicesArr = [];
            for(var i = 0; i < DevicesArrTemp.length; i++)
            {
                fetch(`http://${DevicesArrTemp[i].ip}/getState`)
                .then(res => {
                    if(res.ok){
                        res.text()
                        .then(body => 
                            {
                                if(body.indexOf('NodeMCU') != -1)
                                {
                                    console.log(body);
                                    let ip = body.substring(body.indexOf("NodeMCU&IP")+10,body.indexOf("&Type"));
                                    let type = body.substring(body.indexOf("&Type")+5,body.indexOf("&Name"));
                                    let name = body.substring(body.indexOf("&Name")+5, body.indexOf("&Flipstate"));
                                    let flipState = body.substring(body.indexOf("&Flipstate")+10);
                                    let device = {};
                                    device.ip = ip;
                                    device.type = type;
                                    device.name = name;
                                    device.flipState = flipState;
                                    DevicesArr.push(device);
                                    console.log(`Found NodeMCU at ${ip} with type ${type}`);
                                }else{
                                    console.log("Not a NodeMCU");
                                }
                            });
                    }else{
                        console.log("Not a NodeMCU");
                    }
                })
                .catch(err => console.log("Not a NodeMCU"));
            }
        }else{
            DevicesArr = [];
            KnownIps = [];
            for(var i = 0; i < devices.length; i++)
            {
                KnownIps.push(devices[i].ip);
                fetch(`http://${devices[i].ip}/getState`)
                .then(res => {
                    if(res.ok){
                        res.text()
                        .then(body => 
                            {
                                if(body.indexOf('NodeMCU') != -1)
                                {
                                    console.log(body);
                                    let ip = body.substring(body.indexOf("NodeMCU&IP")+10,body.indexOf("&Type"));
                                    let type = body.substring(body.indexOf("&Type")+5,body.indexOf("&Name"));
                                    let name = body.substring(body.indexOf("&Name")+5, body.indexOf("&Flipstate"));
                                    let flipState = body.substring(body.indexOf("&Flipstate")+10);
                                    let device = {};
                                    device.ip = ip;
                                    device.type = type;
                                    device.name = name;
                                    device.flipState = flipState;
                                    DevicesArr.push(device);
                                    console.log(`Found NodeMCU at ${ip} with type ${type}`);
                                }else{
                                    console.log("Not a NodeMCU");
                                }
                            });
                    }else{
                        console.log("Not a NodeMCU");
                    }
                })
                .catch(err => console.log("Not a NodeMCU")); 
            }
        }

        

    });
};

MonitorNetwork();



/*router defs |||||||||||||||||||||||||||||||||||||||||||||||||||||*/



router.get('/', async (req,res) => {
    let tempDevices = [...DevicesArr];
    updateNetworkDevices();
    res.render('index', {"devices": tempDevices});
    res.end();
});

router.post('/flip', async (req,res) => {
    let ip = req.body.ip;
    flipSwitch(ip,res);
});

router.post('/setName', async (req,res) => {
    let name = req.body.name;
    let ip = req.body.ip;
    setName(name, ip);
    res.end();
});

router.post('/getUpdate', async (req,res) => {

});






app.use('/', router);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Node server running on ${process.env.PORT || 3000}`);
});