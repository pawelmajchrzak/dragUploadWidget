const dropArea = document.querySelector('.drop-section')
const listSection = document.querySelector('.list-section')
const listContainer = document.querySelector('.list')
const fileSelector = document.querySelector('.file-selector')
const fileSelectorInput = document.querySelector('.file-selector-input')

//upload files with browse button
fileSelector.onclick = () => fileSelectorInput.click()
fileSelectorInput.onchange = () => {
    [...fileSelectorInput.files].forEach((file) => {
        if(typeValidation(file.type)&&sizeValidation(file.size)){
            // console.log(file);
            uploadFile(file)
        }
    })
}
//when file is over the drag area
dropArea.ondragover = (e) => {
    e.preventDefault();
    [...e.dataTransfer.items].forEach((item) => {
        if(typeValidation(item.type)&&sizeValidation(file.size)){
            dropArea.classList.add('drag-over-effect')
        }
    })
}
//when file leave the drag area
dropArea.ondragleave = () => {
    dropArea.classList.remove('drag-over-effect')
}
//when file drop on the drag area
dropArea.ondrop = (e) => {
    e.preventDefault();
    dropArea.classList.remove('drag-over-effect')
    if(e.dataTransfer.items){
        [...e.dataTransfer.items].forEach((item) =>{
            if(item.kind === 'file'){
                const file = item.getAsFile();
                if(typeValidation(file.type)&&sizeValidation(file.size)){
                    uploadFile(file)
                }
            }
        })
    }else{
        [...e.dataTransfer.files].forEach((file) =>{
            if(typeValidation(file.type)&&sizeValidation(file.size)){
                uploadFile(file)
            }
        })
    }
}

//check the file type
function typeValidation(type){
    var splitType = type.split('/')[0]
    if(type == 'application/pdf' || splitType == 'image' || splitType == 'video'){
        return true
    } else{
        return true
    }
}
//check size of file
function sizeValidation(size){
    const MAX_SIZE = 1073741824; // 1 GB
    if(size > MAX_SIZE){
        return false;
    } else{
        return true;
    }
}



//upload file function
function uploadFile(file){
    // //do uploading
    // console.log(file);
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
            <div class="file-size">${(file.size/(1024*1024)).toFixed(2)} MB</div>
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
    data.append('file',file)
    http.onload = () => {
        li.classList.add('complete')
        li.classList.remove('in-prog')
    }
    http.upload.onprogress = (e) => {
        var percent_complete = (e.loaded / e.total)*100
        li.querySelectorAll('span')[0].innerHTML = Math.round(percent_complete) + '%'
        li.querySelectorAll('span')[1].style.width = percent_complete + '%'
    }
    http.open('POST','sender.php', true)
    http.send(data)
    li.querySelector('.cross').onclick = () => http.abort()
    http.onabort = () => li.remove()
    //onload file link urlss
    http.onload = () => {
        const response = JSON.parse(http.responseText); // Odczyt JSON odpowiedzi
        if (response.success) {
            li.classList.add('complete');
            li.classList.remove('in-prog');
            
            const div = li.querySelector('.file-link');
            div.style.display = 'inline-block';
            // Link
            const link = li.querySelector('a');
            link.href = response.fileUrl;
            link.textContent = shortenUrl(response.fileUrl, 30); // Skrócony link
            link.title = response.fileUrl; // Pełny link jako podpowiedź
            link.target = '_blank'; // Otwieranie w nowej karcie
            link.style.marginRight = '8px'; // Odstęp od ikony

            // Ikona "Copy"
            const copyIcon = li.querySelector('.file-link img');
            copyIcon.style.cursor = 'pointer'; // Wskazuje, że jest klikalne

            // Obsługa kliknięcia w ikonę
            copyIcon.onclick = () => {
                navigator.clipboard.writeText(response.fileUrl)
                    .then(() => alert('Link skopiowany do schowka!'))
                    .catch(err => console.error('Błąd kopiowania:', err));
            };

        } else {
            console.error('Upload failed:', response.error);
        }
    };
}
// find icon for file
function iconSelector(type) {
    var splitType = (type.split('/')[0] == 'application') ? type.split('/')[1] : type.split('/')[0];
    
    // Obsługa znanych typów
    if (splitType === 'image' || splitType === 'pdf' || splitType === 'video') {
        return splitType + '.png';
    }

    // Domyślna ikona dla innych typów
    return 'other.png';
}

function shortenUrl(url, maxLength) {
    if (url.length <= maxLength) {
        return url; // Jeśli URL jest krótszy niż maxLength, zwracamy cały
    }
    const partLength = Math.floor((maxLength - 3) / 2); // Dzielimy dostępne miejsce
    const start = url.substring(0, partLength); // Początek linku
    const end = url.substring(url.length - partLength); // Koniec linku
    return `${start}...${end}`; // Zwracamy skrócony URL
}