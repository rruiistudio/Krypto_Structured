let status

export default function checkUserStatus(formtext) {
    let data = { walletId: formtext };
    let URL = "https://api.kryptomon.co/egg-hunt/getUser.php";
    
    let res

    console.log(formtext);

    buttonclickhandler();
    
    //status = getStatus(res);
    
    function buttonclickhandler() {
        var SendInfo = JSON.stringify(data);
        $.post(URL, SendInfo, handledata)
    }

    function handledata(response) {
        //var res = JSON.stringify(response);
        localStorage.setItem('json', response);
        console.log(response)
        return res
    }

    
}

export function getStatus(){
    var response = localStorage.getItem('json')
    console.log('item retrieved');
    var r = JSON.parse(response)
    status = r.status;
    console.log(status);
    return status;
}


