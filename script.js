const $restTime = document.querySelector('.box-rest .box-time')
const $workTime = document.querySelector('.box-work .box-time')
const $startButton = document.querySelector('.start-timer')

let timerRunnning = false;

const workTime = formatedTimeToNumber($workTime.textContent)
const restTime = formatedTimeToNumber($restTime.textContent)

const timer = new Timer(workTime, restTime)

$startButton.addEventListener('click', (event) => {
    event.stopPropagation();
    if (timer.running) {
        $startButton.textContent = "Start Timer"
        timer.stopTimer();
    }
    else if (!timer.running) {
        $startButton.textContent = "Stop Timer"
        timer.startTimer();
    }
})


function Timer(workTime, restTime) {

    this.running = false;
    this.isWorkTime = true;

    this.stopTimer = () => {
        this.running = false;
        clearInterval(this.interval)
    }

    this.startTimer = () => {

        this.running = true;
        if (!this.currentTime) {
            this.currentTime = workTime
        }

        this.interval = setInterval(() => {
        
            if (this.currentTime === 0) {
                if (this.isWorkTime) {
                    this.isWorkTime = false
                    this.currentTime = restTime
                    $workTime.textContent = formatTime(workTime)
                }
                else {
                    this.isWorkTime = true
                    this.currentTime = workTime
                    $restTime.textContent = formatTime(restTime)
                }
            }

            this.currentTime -= seconds(1)
            if (this.isWorkTime) {
                $workTime.textContent = formatTime(this.currentTime)
            }
            else {
                $restTime.textContent = formatTime(this.currentTime)
            }

        }, seconds(1))
    }

}

function seconds (number) {
    return number * 1000
}

function minutes (number) {
    return seconds(number * 60)
}

function formatTime (time) {
    const minutesStr = Math.floor(time / minutes(1))
    const secondsStr = ((time - (minutesStr * minutes(1))) / seconds(1))

    let formatedString = ""
    if (minutesStr === 0) {
        formatedString += "00"
    } else if (minutesStr < 10) {
        formatedString += `0${minutesStr}`
    } else {
        formatedString += minutesStr
    }

    formatedString += ":"

    if (secondsStr === 0) {
        formatedString += "00"
    } else if (secondsStr < 10) {
        formatedString += `0${secondsStr}`
    } else {
        formatedString += secondsStr
    }

    return formatedString
}

function formatedTimeToNumber (formatedTime) {
    const [formatedMinutes, formatedSeconds] = formatedTime.split(":")
    const time = minutes(formatedMinutes) + seconds(formatedSeconds)
    return time
}




