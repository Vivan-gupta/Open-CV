document.addEventListener('DOMContentLoaded', () => {
    fetch('/known-images')
        .then(response => response.json())
        .then(files => {
            const gallery = document.querySelector('.gallery');
            files.forEach(file => {
                const imgWrapper = document.createElement('div');
                imgWrapper.className = 'image-card';

                const img = document.createElement('img');
                img.src = `/known_faces/${file}`;
                img.alt = 'Known Person';

                const imageName = document.createElement('div');
                imageName.className = 'image-name';
                imageName.textContent = file; // Display the file name

                imgWrapper.appendChild(img);
                imgWrapper.appendChild(imageName);
                gallery.appendChild(imgWrapper);
            });
        })
        .catch(error => console.error('Error:', error));
});
