import axios from "axios";
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const refs = {
    searchForm: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    loadMore: document.querySelector('.load-more'),
}

refs.loadMore.style.display = 'none';
// for search from API
const BASE_URL = 'https://pixabay.com/api/';
let totalShown = 0;
let myPage = 1;

refs.searchForm.addEventListener('submit', onInputSearch);

function onInputSearch(event) {
    event.preventDefault();
    refs.gallery.innerHTML = '';

    const query = refs.searchForm.querySelector('input').value;
    // console.log(query);

    // Если поиск не заполнен, то вывода нет (обнуляем любой поиск), иначе - рисуем? djpvj;yj
    if (!query) {
        refs.gallery.innerHTML = '';
        refs.loadMore.style.display = 'none';
        return Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
    } else {
        downloadFromPixabay(query);
        console.log("тут буду рисовать")
    }

}

//** публичный API сервиса Pixabay */

async function downloadFromPixabay(query, myPage) {
    const options = {
        params: {
            key: '31212742-df383ab72ff5d16a82f89e026',
            q: query,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: 'true',
            page: myPage,
            per_page: 40,
            
        },
    };

    try {
        const findArray = await axios.get(BASE_URL, options);
        totalShown += findArray.data.hits.length;

        console.log(findArray.data);
        console.log(findArray.data.hits.length);
        console.log(findArray.data.total);


        // forMessage(
        //     findArray.data.hits.length,
        //     totalShown,
        //     options.params.per_page,
        //     findArray.data.total
        // );
        
        if (findArray.data.hits.length < 1) {
            return Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
        };

        createGallery(findArray.data);

    } catch (error) {
        console.log('Ничего не получается', error);
    };

}

function createGallery(pictures) {
    const markup = pictures.hits
        .map(({webformatURL, tags, largeImageURL, likes, views, comments, downloads }) => {
            // console.log(tags);
            // console.log(webformatURL);
            // console.log(likes);
            return `
                <a class="gallery__item" href="${largeImageURL}">
                    <div class="photo-card">
                        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                        <div class="info">
                            <p class="info-item">
                                <b>Likes: </b>${likes}
                            </p>
                            <p class="info-item">
                                <b>Views: </b>${views}
                            </p>
                            <p class="info-item">
                                <b>Comments: </b>${comments}
                            </p>
                            <p class="info-item">
                                <b>Downloads: </b>${downloads}
                            </p>
                        </div>
                    </div>
                </a>
            `;
        })
        .join('');
    console.log(markup);
    refs.gallery.insertAdjacentHTML('beforeend', markup);
    gallerySimpleLightBox.refresh();


}

//  Modal window
let gallerySimpleLightBox = new SimpleLightbox('.gallery a', {
    /* options */
    captionsData: 'alt',
    captionDelay: 250,
    animationSpeed: 200,
    scaleImageToRatio: true,

});