
export function userLogError(e, fileName){
    let message = e.message;
    if (fileName){
        message = "Couldn't load file " + fileName + " : " + message;
    }
    userLogMessage(e.name + ": " + message);
}

export function userLogMessage(message, color='white'){
    console.log(message);
    const logElement = document.createElement("div");
    logElement.textContent = currentDate() + ': ' + message;
    logElement.setAttribute("class", "log");
    let htmlLogElement;
    const parentElement = document.getElementById("logs")
    const firstChild = parentElement.firstChild;
    if(firstChild){
        htmlLogElement = parentElement.insertBefore(logElement, firstChild);
    }
    else{
        htmlLogElement = document.getElementById("logs").appendChild(logElement);
    }
    htmlLogElement.style.color=color;
  }

export function showLogs(){
    const logs = document.getElementsByClassName('log');
    for (let log of logs){
        log.style.visibility = 'visible';
    }
}

export function hideLogs(){
    const logs = document.getElementsByClassName('log');
    for (let log of logs){
        log.classList.add('notransition');
        log.style.visibility = 'hidden';
    }
}

function currentDate(){
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date+' '+time;
}