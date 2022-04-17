let elBody = document.querySelector("body");
let elDarkMode = document.querySelector("#dark-mode");
let elBookTemplate = document.querySelector("#book-template").content;
let elBookmarkTemplate = document.querySelector("#bookmark-template").content;
let elBookWrapper = document.querySelector("#book-wrapper");
let elBookmarkWrapper = document.querySelector("#bookmark-wrapper");
let elSearchResult = document.querySelector("#main-result");
let elOrderBook = document.querySelector("#main-order");
let elReadBtn = document.querySelector("#read-btn");
let elCanvas = document.querySelector("#offcanvasRight");
let elForm = document.querySelector("#main-form");
let elInput = document.querySelector("#main-input");


elForm.addEventListener("submit", function (evt) {
    evt.preventDefault();
    
    let inputValue = elInput.value.trim();
    
    ;(async function () {
        let responce = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${inputValue}`);
        let result = await responce.json();
        
        renderBooks(result.items, elBookWrapper);
    })();
    
    elInput.value = null;
});

function renderBooks(array, node) {
    node.innerHTML = null;
    let bookFragment = document.createDocumentFragment();
    
    array.forEach(item => {
        let bookTemplate = elBookTemplate.cloneNode(true);
        
        
        bookTemplate.querySelector("#book-img").src = item.volumeInfo.imageLinks.thumbnail;
        bookTemplate.querySelector("#book-name").textContent = item.volumeInfo.title;
        bookTemplate.querySelector("#book-author").textContent = item.volumeInfo.authors;
        bookTemplate.querySelector("#book-year").textContent = item.volumeInfo.publishedDate;
        bookTemplate.querySelector("#bookmark-btn").dataset.bookmarkId = item.id;
        bookTemplate.querySelector("#modal-info").dataset.canvasId = item.id;
        bookTemplate.querySelector("#read-btn").href = item.volumeInfo.previewLink;
        
        bookFragment.appendChild(bookTemplate);
    });
    
    let lengthOfBooks = array.length;
    
    elSearchResult.textContent = lengthOfBooks
    
    node.appendChild(bookFragment);
};

elBookWrapper.addEventListener("click", function (evt) {
    let modalID = evt.target.dataset.modalId;
    
    if (modalID) {
        ;(async function () {
            let responce = await fetch (`https://www.googleapis.com/books/v1/volumes/${modalID}`);
            let date = await responce.json();
            
            let modalArray = [];
            modalArray.push(date);
            
            modalArray.forEach(item => {
                elModal.querySelector(".modal-name").textContent  = item.volumeInfo.title;
                elModal.querySelector("#modal-img").src = item.volumeInfo.imageLinks.smallThumbnail
                elModal.querySelector("#modal-sum").textContent = item.volumeInfo.description;
                elModal.querySelector("#modal-author").textContent = item.volumeInfo.authors;
                elModal.querySelector("#modal-published").textContent = item.volumeInfo.publishedDate;
                elModal.querySelector("#modal-publishers").textContent = item.volumeInfo.publisher;
                elModal.querySelector("#modal-categories").textContent = item.volumeInfo.categories;
                elModal.querySelector("#modal-page").textContent = item.volumeInfo.pageCount;
                elModal.querySelector("#read-btn").href = item.volumeInfo.previewLink;
                
            })
            modalArray = null;
        })();
    }
});

async function fetchBookmarks(item) {
    let responce = await fetch(`https://www.googleapis.com/books/v1/volumes/${item}`);
    let date = await responce.json()
    
    return date
}

let storage = window.localStorage;

let getBookmark = JSON.parse(storage.getItem("bookArray"))

let bookmarkedBooks = getBookmark || []

elBookWrapper.addEventListener("click", async function (evt) {
    let foundBookId = evt.target.dataset.bookmarkId
    
    
    if (foundBookId) {
        let date = await fetchBookmarks(foundBookId)
        
        let dateArray = []
        dateArray.push(date)
        
        let foundBook = dateArray.find(item => item.id == foundBookId)
        
        let doesInclude = bookmarkedBooks.findIndex(item => item.id === foundBook.id)
        
        if (doesInclude === -1) {
            bookmarkedBooks.unshift(foundBook)
            
            storage.setItem("bookArray", JSON.stringify(bookmarkedBooks))
            
            renderBookmarks(bookmarkedBooks, elBookmarkWrapper)
        }
    }
})

function renderBookmarks(array, node) {
    node.innerHTML = null
    let bookmarkFragment = document.createDocumentFragment()
    
    array.forEach(item => {
        let bookmarkTemplate = elBookmarkTemplate.cloneNode(true);
        
        bookmarkTemplate.querySelector("#bookmark-name").textContent = item.volumeInfo.title;
        bookmarkTemplate.querySelector("#bookmark-author").textContent = item.volumeInfo.authors;
        bookmarkTemplate.querySelector("#read-btn").href = item.volumeInfo.previewLink;
        bookmarkTemplate.querySelector("#remove-btn").dataset.bookRemoveId = item.id;
        
        bookmarkFragment.appendChild(bookmarkTemplate)
    })
    
    node.appendChild(bookmarkFragment)
}

elBookmarkWrapper.addEventListener("click", function (evt) {
    let deleteID = evt.target.dataset.bookRemoveId
    
    if (deleteID) {
        let indexOfBooks = bookmarkedBooks.find(item => item.id == deleteID)
        
        bookmarkedBooks.splice(indexOfBooks, 1)
        
        storage.setItem("bookArray", JSON.stringify(bookmarkedBooks))
        
        renderBookmarks(bookmarkedBooks, elBookmarkWrapper)
    }
    
})