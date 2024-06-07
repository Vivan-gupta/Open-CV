document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.querySelector('.file-input');
    const dropArea = document.querySelector('.drag-area');
    const fileLabel = document.querySelector('.custom-file-upload');
    const form = document.getElementById('upload-form');

    dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropArea.classList.add('active');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('active');
    });

    dropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        fileInput.files = event.dataTransfer.files;
        showFiles(fileInput.files);
        dropArea.classList.remove('active');
    });

    fileInput.addEventListener('change', () => {
        showFiles(fileInput.files);
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        const imageNameInput = document.getElementById('imageName').value.trim();
        if (imageNameInput) {
            formData.append('imageName', imageNameInput);
        }

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            showModal('Your file has been uploaded successfully!');
        })
        .catch((error) => {
            showModal('Error during file upload: ' + error.message);
        });
    });

    function showFiles(files) {
        if (files.length > 1) {
            fileLabel.textContent = files.length + ' files selected';
        } else {
            fileLabel.textContent = files[0].name;
        }
    }

    function showModal(message) {
        const modal = document.getElementById('uploadModal');
        const modalText = document.getElementById('modal-text');
        const closeButton = document.querySelector('.close');

        modalText.textContent = message;
        modal.style.display = 'block';

        closeButton.onclick = function() {
            modal.style.display = 'none';
        }

        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        }
    }
});
