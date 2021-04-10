const React = require('react');

function IndexForward(props){

    let devicesElArr = [];

    for(var i = 0; i < props.devices.length; i++)
    {
        let ipId = props.devices[i].ip.replace('.','_');
        devicesElArr.push(
            <div class="flipBtn" id={ipId}>
                {`ip:${props.devices[i].ip} name:${props.devices[i].name} state:${props.devices[i].flipState}`}
            </div>
        )
    }

    return (<html>
                <head>
                    <meta charset="utf-8"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1"/>
                    <script type="text/javascript" src="/resources/publicScript.js"></script>
                    
                </head>
                <body>
                    {devicesElArr}
                </body>
            </html>);
}

/*<link href="/resources/publicStyles.css" rel="stylesheet"></link>
<script type="text/javascript" src="/resources/publicScript.js"></script>*/

module.exports = IndexForward;