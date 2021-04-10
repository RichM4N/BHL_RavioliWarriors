

window.onload = () => {

    let arr = document.getElementsByClassName("flipBtn");
    for(var i = 0; i < arr.length; i++)
    {
        arr[i].addEventListener('click', (e) => {
            callFlipCommand(e);
        });
    }

};

const callFlipCommand = (e) => {

    let ip = e.target.innerHTML;
    ip = ip.substring(ip.indexOf("ip:")+3, ip.indexOf("name")-1);

    fetch('/flip', 
    {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',
        },
        body: JSON.stringify({"ip": ip})
    })
    .then(response => response.json())
    .then((data) => {
        let curretnText = document.getElementById(data.ip.replace(".","_")).innerHTML;
        document.getElementById(data.ip.replace(".","_")).innerHTML = curretnText.substring(0,curretnText.length-1) + data.state;
    })

};