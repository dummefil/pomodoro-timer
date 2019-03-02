const $restTime = document.querySelector('.box-rest .box-time')
const $workTime = document.querySelector('.box-work .box-time')
const $startButton = document.querySelector('.start-timer')
const $resetButton = document.querySelector('.reset-timer')

let timer

let defaultWorkTime
let defaultRestTime

const savedWorkTime = localStorage.getItem('default work time') 
if (savedWorkTime) {
    defaultWorkTime = formatedTimeToNumber(savedWorkTime)
} else {
    defaultWorkTime = formatedTimeToNumber($workTime.textContent) 
}

const savedRestTime = localStorage.getItem('default rest time') 
if (savedRestTime) {
    defaultRestTime = formatedTimeToNumber(savedRestTime)
} else {
    defaultRestTime = formatedTimeToNumber($restTime.textContent) 
}

setDefaults()

$startButton.addEventListener('click', (event) => {
    const workTime = formatedTimeToNumber($workTime.textContent)
    const restTime = formatedTimeToNumber($restTime.textContent)

    if (!timer || !timer.running) {
        timer = new Timer(workTime, restTime)
    }

    event.stopPropagation()
    if (timer.running) {
        $startButton.textContent = 'Start Timer'
        timer.stopTimer()
    }
    else if (!timer.running) {
        $startButton.textContent = 'Stop Timer'
        timer.startTimer()
    }
})

$resetButton.addEventListener('click', () => {
    event.stopPropagation()
    if (!timer.running) setDefaults()
})

function Timer(workTime, restTime) {

    this.running = false
    this.isWorkTime = true

    this.stopTimer = () => {
        this.running = false
        clearInterval(this.interval)
    }

    this.startTimer = () => {

        this.running = true
        if (!this.currentTime) {
            this.currentTime = workTime
        }

        this.interval = setInterval(() => {
        
            if (this.currentTime === 0) {
                
                if (this.isWorkTime) {
                    this.isWorkTime = false
                    this.currentTime = restTime
                    $workTime.textContent = formatTime(workTime)
                    sendNotification('READY TO REST')
                }
                else {
                    this.isWorkTime = true
                    this.currentTime = workTime
                    $restTime.textContent = formatTime(restTime)
                    sendNotification('READY TO WORK')
                }
                const audio = new Audio('pomodoro.mp3')
                audio.loop = false
                audio.play()
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

    let formatedString = ''
    if (minutesStr === 0) {
        formatedString += '00'
    } else if (minutesStr < 10) {
        formatedString += `0${minutesStr}`
    } else {
        formatedString += minutesStr
    }

    formatedString += ':'

    if (secondsStr === 0) {
        formatedString += '00'
    } else if (secondsStr < 10) {
        formatedString += `0${secondsStr}`
    } else {
        formatedString += secondsStr
    }

    return formatedString
}

function formatedTimeToNumber (formatedTime) {
    const [formatedMinutes, formatedSeconds] = formatedTime.split(':')
    const time = minutes(formatedMinutes) + seconds(formatedSeconds)
    return time
}

function sendNotification(string) {
    if (Notification.permission === 'granted') {
        new Notification(string)
    }

    else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                new Notification(string)
            }
        })
    }
}

const $timeUpButtons = document.querySelectorAll('.box-control-up')
const $timeDownButtons = document.querySelectorAll('.box-control-down')

const timeStep = seconds(30)
const minimumTime = timeStep


$timeUpButtons.forEach(($timeUpButton) => {
    const $time = $timeUpButton.parentElement.previousElementSibling
    $timeUpButton.addEventListener('click', () => {
        const currentTime = formatedTimeToNumber($time.textContent)
        if (timer && timer.running) {
            return
        }
        const changedTime = currentTime + timeStep
        $time.textContent = formatTime(changedTime)
        saveDefaults()
    })
})

$timeDownButtons.forEach(($timeDownButton) => {
    const $time = $timeDownButton.parentElement.previousElementSibling
    $timeDownButton.addEventListener('click', () => {
        const currentTime = formatedTimeToNumber($time.textContent)
        if (currentTime <= minimumTime || timer && timer.running) {
            return
        }
        const changedTime = currentTime - timeStep
        $time.textContent = formatTime(changedTime)
        saveDefaults()
    })
})

function saveDefaults () {
    defaultWorkTime = formatedTimeToNumber($workTime.textContent)
    defaultRestTime = formatedTimeToNumber($restTime.textContent)

    localStorage.setItem('default work time', $workTime.textContent)
    localStorage.setItem('default rest time', $restTime.textContent)
}

function setDefaults () {
    $workTime.textContent = formatTime(defaultWorkTime)
    $restTime.textContent = formatTime(defaultRestTime)
}

const $notes = document.querySelector('.notes')

const savedNotes = localStorage.getItem('notes')
if (savedNotes) {
    $notes.value = savedNotes
}

let notesCounter = 1
let lastNote

$notes.addEventListener('keydown', (event) => {

    function spawnLine (notesCounter) {
        $notes.value += `${notesCounter += 1}. `
    }

    if (event.ctrlKey === true) {
    } else if ($notes.selectionStart === 0 && ($notes.value.length === $notes.selectionEnd)) {
        $notes.value = ''
        spawnLine(0)
    } else if ($notes.value === '') {
        spawnLine(0)
    }

    const strings = $notes.value.split('\n')

    if (event.code === 'Backspace') {
        if ($notes.value) {
            let lastString = strings.pop()
            if (lastString.length === 3 || lastString.length === 2) {
                event.stopPropagation()
                event.preventDefault()
                lastString = ''
                strings.push(lastString)
                $notes.value = strings.join('\n')
            }
        }
    }

    if (event.code === 'Enter') {
        event.stopPropagation()
        event.preventDefault()

        if (!$notes.value) {
            notesCounter = 0
        } else {
            let lastCountedString = strings.pop().split('.').shift()

            if (lastCountedString) {
                notesCounter = +lastCountedString || 0
                $notes.value += `\n`
            }
    
            if (!lastCountedString) {
                lastCountedString = strings[strings.length - 1].split('.').shift()
                notesCounter = +lastCountedString || 0
            }
            
        }
        spawnLine(notesCounter)
    }
    localStorage.setItem('notes', $notes.value)
})
