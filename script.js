
const tipsText = document.querySelector(".tips-text");
const refresh = document.getElementById('refresh');
const timerDisplay = document.getElementById("timer-display");
const phaseDisplay = document.getElementById("phase");
const timerStatus = document.getElementById("timer-status");
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");
const progressBar = document.getElementById("timer-progress");

const durationInputs = {
    work: document.getElementById("work"),
    shortBreak: document.getElementById("short-break"),
    longBreak: document.getElementById("long-break")
};

const phaseNames = {
    work: "Work",
    shortBreak: "Short break",
    longBreak: "Long break"
};

let currentPhase = "work";
let completedWorkSessions = 0;
let remainingSeconds = getDurationSeconds(currentPhase);
let totalPhaseSeconds = remainingSeconds; 
let timerInterval = null;
let endTime = null;

function getDurationSeconds(phase) {
    const input = durationInputs[phase];

    if (!input || !input.checkValidity() || !Number.isInteger(input.valueAsNumber)) {
        return null;
    }

    return input.valueAsNumber * 60;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(remainingSeconds);
  phaseDisplay.textContent = phaseNames[currentPhase];

  if (totalPhaseSeconds > 0) {
    progressBar.value = remainingSeconds;
    progressBar.max = totalPhaseSeconds;
  } else {
    progressBar.value = 100;
    progressBar.max = 100;
  }
}


function updateControls() {
    const isRunning = timerInterval !== null;

    startButton.disabled = isRunning;
    pauseButton.disabled = !isRunning;
    Object.values(durationInputs).forEach(input => {
        input.disabled = isRunning;
    });
}

function stopTimer() {
    window.clearInterval(timerInterval);
    timerInterval = null;
    endTime = null;
    updateControls();
}

function finishPhase() {
    stopTimer();

    if (currentPhase === "work") {
        completedWorkSessions += 1;
        currentPhase = completedWorkSessions % 4 === 0 ? "longBreak" : "shortBreak";
        timerStatus.textContent = `Work session complete. Start your ${phaseNames[currentPhase].toLowerCase()}.`;
    } else {
        if (currentPhase === "longBreak") {
            completedWorkSessions = 0;
        }

        currentPhase = "work";
        timerStatus.textContent = "Break complete. Ready for another work session?";
    }
    totalPhaseSeconds = remainingSeconds; 
    remainingSeconds = getDurationSeconds(currentPhase);
    updateDisplay();
}

function tick() {
    remainingSeconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    updateDisplay();

    if (remainingSeconds === 0) {
        finishPhase();
    }
}

startButton.addEventListener("click", () => {
    const configuredDuration = getDurationSeconds(currentPhase);
    if (configuredDuration === null) {
        timerStatus.textContent = "Enter a valid duration before starting.";
        return;
    }

    if (remainingSeconds === null) {
        remainingSeconds = configuredDuration;
    }

    endTime = Date.now() + remainingSeconds * 1000;
    timerInterval = window.setInterval(tick, 250);
    timerStatus.textContent = `${phaseNames[currentPhase]} session in progress.`;
    updateControls();
});

pauseButton.addEventListener("click", () => {
    if (timerInterval !== null) {
        remainingSeconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
        stopTimer();
        updateDisplay();
        timerStatus.textContent = "Timer paused.";
    }
});

resetButton.addEventListener("click", () => {
    stopTimer();
    currentPhase = "work";
    completedWorkSessions = 0;
    remainingSeconds = getDurationSeconds(currentPhase);
    totalPhaseSeconds = remainingSeconds; 
    timerStatus.textContent = "Timer reset.";
    updateDisplay();
});

Object.entries(durationInputs).forEach(([phase, input]) => {
    input.addEventListener("change", () => {
        if (!input.checkValidity() || !Number.isInteger(input.valueAsNumber)) {
            timerStatus.textContent = `Enter a valid ${phaseNames[phase].toLowerCase()} duration.`;
            return;
        }
        if (phase === currentPhase && timerInterval === null) {
            remainingSeconds = getDurationSeconds(currentPhase);
            totalPhaseSeconds = remainingSeconds;
            updateDisplay();
        }

        timerStatus.textContent = "";
    });
});

totalPhaseSeconds = remainingSeconds; 

updateDisplay();
updateControls();

refresh.addEventListener('click', function() {
    fetch('https://api.adviceslip.com/advice')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Advice request failed: ${response.status}`);
            }

            return response.json();
        })
        .then(data => {
            if (!data.slip || typeof data.slip.advice !== "string") {
                throw new Error("Advice response did not contain a valid tip.");
            }

            tipsText.textContent = data.slip.advice;
        })
        .catch(error => {
            console.error("Error fetching advice:", error);
            tipsText.textContent = "Unable to load a tip right now.";
        });
});
