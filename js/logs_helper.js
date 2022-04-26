
export function userLogMessage(message){
    console.log(message);
    const logElement = document.createElement("div");
    logElement.textContent = message;
    logElement.setAttribute("class", "log");
    const htmlLogElement = document.getElementById("logs").appendChild(logElement);
    // setTimeout(() => {
    //   htmlLogElement.remove();
    // }, 15000);
  }

export function showLogs(){
    const logs = document.getElementsByClassName('log');
    for (let log of logs){
        log.style.visibility = 'visible';
    }
}

export function hideLogs(){
    console.log('hide');
    const logs = document.getElementsByClassName('log');
    for (let log of logs){
        log.classList.add('notransition');
        log.style.visibility = 'hidden';
    }
}