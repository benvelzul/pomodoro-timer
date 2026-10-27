
const tipsText = document.querySelector(".tips-text");
const refresh = document.getElementById('refresh');

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
