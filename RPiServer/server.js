/*express */
const express = require('express');
const router = express.Router();
const app = express();

/*body parser*/
const bodyParser = require('body-parser');

/*local-devices*/
const find = require('local-devices');

/*node fetch*/
const fetch = require('node-fetch');

router.get('/', async (req,res) => {

    find().then((devices) => {
        console.table(devices);

        for(var i = 0; i < devices.length; i++)
        {
            fetch(`http://${devices[i].ip}/init`)
            .then(res => {
                if(res.ok){
                    res.text()
                    .then(body => 
                        {
                            if(body.indexOf('NodeMCU') != -1)
                            {
                                let ip = body.substring(body.indexOf("NodeMCU&IP")+10,body.indexOf("&Type"));
                                let type = body.substring(body.indexOf("&Type")+5);
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

    });
    res.end();

});

app.use('/', router);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Node server running on ${process.env.PORT || 3000}`);
});