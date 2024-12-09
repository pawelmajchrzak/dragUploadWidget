const dropArea = document.querySelector('.drop-section')
const listSection = document.querySelector('.list-section')
const listContainer = document.querySelector('.list')
const fileSelector = document.querySelector('.file-selector')
const fileSelectorInput = document.querySelector('.file-selector-input')

//upload files with browse button
fileSelector.onclick = () => fileSelectorInput.click()
fileSelectorInput.onchange = () => {
    [...fileSelectorInput.files].forEach((file) => {
        if (sizeValidation(file.size)) {
            uploadFile(file)
        }
    })
}
//when file is over the drag area
dropArea.ondragover = (e) => {
    e.preventDefault();
    dropArea.classList.add('drag-over-effect');
}
//when file leave the drag area
dropArea.ondragleave = () => {
    dropArea.classList.remove('drag-over-effect')
}
//when file drop on the drag area
dropArea.ondrop = (e) => {
    e.preventDefault();
    dropArea.classList.remove('drag-over-effect');

    const items = e.dataTransfer.items || e.dataTransfer.files;

    [...items].forEach(item => {
        const file = item.kind === 'file' ? item.getAsFile() : item;
        handleFileUpload(file);
    });
};

const handleFileUpload = (file) => {
    if (sizeValidation(file.size)) {
        uploadFile(file);
    }
};

//check size of file
function sizeValidation(size) {
    const MAX_SIZE = 1073741824; // 1 GB
    if (size > MAX_SIZE) {
        return false;
    } else {
        return true;
    }
}

//upload file function
function uploadFile(file) {
    listSection.style.display = 'block'
    var li = document.createElement('li')
    li.classList.add('in-prog')
    li.innerHTML = `
        <div class="col">
            <img src="icons/${iconSelector(file.type)}" alt="" height="60">
        </div>
        <div class="col">
            <div class="file-name">
                <div class="name">${file.name}</div>
                <span>50%</span>
            </div>
            <div class="file-progress">
                <span></span>
            </div>
            <div class="file-size">${(file.size / (1024 * 1024)).toFixed(2)} MB</div>
            <div class="file-link" style="margin-top: 5px; display: none">
                <a href="#" target="_blank">Download</a>
                <img src="icons/copy.png" alt="" height="15">
            </div>
        </div>
        <div class="col">
            <svg width="27" height="27" xmlns="http://www.w3.org/2000/svg" class="cross"><path d="M7.56 7.56 L19.44 19.44 M19.44 7.56 L7.56 19.44" fill="none" stroke="red" stroke-width="2.16" stroke-linecap="round" /></svg>
            <svg width="27" height="27" xmlns="http://www.w3.org/2000/svg" class="tick"><path d="M5.4 13.5 L10.8 18.9 L21.6 8.1" fill="none" stroke="green" stroke-width="2.16" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </div>
    `
    listContainer.prepend(li)
    var http = new XMLHttpRequest()
    var data = new FormData()
    data.append('file', file)
    http.onload = () => {
        li.classList.add('complete')
        li.classList.remove('in-prog')
    }
    http.upload.onprogress = (e) => {
        var percent_complete = (e.loaded / e.total) * 100
        li.querySelectorAll('span')[0].innerHTML = Math.round(percent_complete) + '%'
        li.querySelectorAll('span')[1].style.width = percent_complete + '%'
    }
    http.open('POST', 'sender.php', true)
    http.send(data)
    li.querySelector('.cross').onclick = () => http.abort()
    http.onabort = () => li.remove()
    http.onload = () => {
        try {
            const response = JSON.parse(http.responseText);
            if (response.success) {
                updateFileStatus(li, response.fileUrl);
            } else {
                console.error('Upload failed:', response.error);
            }
        } catch (error) {
            console.error('Error parsing response:', error);
        }
    };
}

//find icon for file
function iconSelector(type) {
    const splitType = type.split('/')[1] || type.split('/')[0];
    const supportedTypes = ['image', 'pdf', 'video'];
    if (supportedTypes.includes(splitType)) {
        return `${splitType}.png`;
    }
    return 'other.png';
}

function shortenUrl(url, maxLength) {
    if (url.length <= maxLength) {
        return url;
    }
    const partLength = Math.floor((maxLength - 3) / 2);
    const start = url.substring(0, partLength);
    const end = url.substring(url.length - partLength);
    return `${start}...${end}`;
}

function updateFileStatus(li, fileUrl) {
    li.classList.add('complete');
    li.classList.remove('in-prog');
    const div = li.querySelector('.file-link');
    div.style.display = 'inline-block';
    const link = li.querySelector('a');
    setLinkAttributes(link, fileUrl);
    const copyIcon = li.querySelector('.file-link img');
    setCopyIcon(copyIcon, fileUrl);
}

function setLinkAttributes(link, fileUrl) {
    link.href = fileUrl;
    link.textContent = shortenUrl(fileUrl, 40);
    link.title = fileUrl;
    link.target = '_blank';
    link.style.marginRight = '8px';
}

function setCopyIcon(copyIcon, fileUrl) {
    copyIcon.style.cursor = 'pointer';
    copyIcon.onclick = () => {
        navigator.clipboard.writeText(fileUrl)
            .then(() => alert('Link skopiowany do schowka!'))
            .catch(err => console.error('Błąd kopiowania:', err));
    };
}