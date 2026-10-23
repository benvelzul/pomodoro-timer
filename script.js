
const tipsText = document.querySelector(".tips-text");

const refresh = document.getElementById('refresh');

refresh.addEventListener('click', function() {
    fetch('https://api.adviceslip.com/advice')
        .then(response => response.json())
        .then(data => 
            tipsText.textContent = data.slip.advice)
        .catch(error => console.error('Error fetching data:', error));
});
