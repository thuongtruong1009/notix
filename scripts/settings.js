let closeBtn = document.querySelector('#settings #close_settings');

closeBtn.addEventListener('click', () => {
    let settings = document.getElementById('settings');
    settings.classList.remove('active');
})