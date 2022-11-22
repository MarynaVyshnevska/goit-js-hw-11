import axios from "axios";
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import OnlyScroll from 'only-scrollbar';

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
refs.searchForm.addEventListener('input', onInputEnter);
refs.loadMore.addEventListener('click', onLoadMore);



function onInputSearch(event) {
    event.preventDefault();
    refs.gallery.innerHTML = '';

    const query = refs.searchForm.querySelector('input').value;
    // console.log(query);

    // Если поиск не заполнен, то вывода нет (обнуляем любой поиск), иначе - рисуем? djpvj;yj
    if (!query) {
        refs.gallery.innerHTML = '';
        return Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
    } else {
        downloadFromPixabay(query);
        // console.log("тут буду рисовать")
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
        console.log(totalShown);

        messageAboutResult(
            findArray.data.hits.length,
            totalShown,
            findArray.data.total
        );
        
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
    // console.log(markup);
    refs.gallery.insertAdjacentHTML('beforeend', markup);
    gallerySimpleLightBox.refresh();


}

//  Modal window in gallery
let gallerySimpleLightBox = new SimpleLightbox('.gallery a', {
    /* options */
    captionsData: 'alt',
    captionDelay: 250,
    animationSpeed: 200,
    scaleImageToRatio: true,

});

function messageAboutResult(length, shown, total) {
    console.log('total', total);
    console.log('shown', shown);
    if (length < 1) {
        Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
        console.log("Sorry, there are no images matching your search query. Please try again.")
    }
    if(shown >= 1) {
        Notiflix.Notify.info(`"Hooray! We found ${total} images."`);
        console.log(`"Hooray! We found ${total} images."`)
    }
    if (total > shown) {
        refs.loadMore.style.display = 'flex';

    }
    if (totalShown === total) {
        refs.loadMore.style.display = 'none';
        Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.");
        console.log("We're sorry, but you've reached the end of search results.")
    }
}

// button loadMore
function onLoadMore() {
    myPage += 1;
    const query = refs.searchForm.querySelector('input').value;
    downloadFromPixabay(query, myPage);
    // console.log(myPage);
    // плавная прокрутка
    const { height: cardHeight } = document
        .querySelector(".gallery")
        .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });
}

// бесконечный скролл
window.addEventListener('scroll', () => {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement
    if(scrollHeight - clientHeight === scrollTop) {
        onLoadMore()
    }
})

    // если во время вівода одного запроса вводим другой
    // - удаляется весь предідущтй вівод фото
function onInputEnter(evt) {
    const q = refs.searchForm.querySelector('input').value;
    if (q.length <= 1) {
        refs.gallery.innerHTML = '';
        refs.loadMore.style.display = 'none';
    }
}
// плавная прокрутка
// const { height: cardHeight } = document
//   .querySelector(".gallery")
//   .firstElementChild.getBoundingClientRect();

// window.scrollBy({
//   top: cardHeight * 2,
//   behavior: "smooth",
// });

// alert( window.innerWidth ); // полная ширина окна
// alert( document.documentElement.clientWidth ); // ширина окна за вычетом полосы прокрутки
// getBoundingClientRect()
// Метод elem.getBoundingClientRect() возвращает координаты
// в контексте окна для минимального по размеру прямоугольника,
// который заключает в себе элемент elem, в виде объекта встроенного
// класса DOMRect. https://learn.javascript.ru/coordinates

// window.scrollBy https://learn.javascript.ru/size-and-scroll-window
// Метод scrollBy(x, y) прокручивает страницу относительно её текущего
// положения.Например, scrollBy(0, 10) прокручивает страницу на 10px вниз.
// Задание scroll - behavior через JavaScript
// https://www.kobzarev.com/programming/scroll-behavior/
// window.scrollBy({
//     top: 666,
//     behavior: 'smooth'
// });
// Или так:
// window.scrollTo( 0, 999, {
//     behavior: 'smooth'
// });
// Возможные значения scroll-behavior
// auto	На усмотрение браузера
// instant	Мгновенная прокрутка
// smooth	Плавная прокрутка