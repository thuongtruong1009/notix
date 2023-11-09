let closeBtn = document.querySelector('#modal #close_settings');

closeBtn.addEventListener('click', () => {
    let modal = document.getElementById('modal');
    modal.classList.remove('active');
})