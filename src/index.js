import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
const axios = require('axios').default;

const input = document.querySelector('.search-input');
const buttonSearch = document.querySelector('.search-button');
const buttonLoadMore = document.querySelector('.load-more');
const gallery = document.querySelector('.gallery');
const toggle = document.querySelector('.toggle');
let text = document.querySelector('.text-after');
const buttonToTop = document.querySelector('.scroll-to-top-button');

let pageNr = 0;
buttonLoadMore.className = 'load-more-hidden';

async function getPhotos(name, pageNr) {
  if (name === '') {
    Notiflix.Notify.failure('Search input cannot be empty.');
  } else
    try {
      const response = await axios.get(
        `https://pixabay.com/api/?key=31879858-48b8240230109758709fe8f87&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${pageNr}`
      );
      const data = response.data;
      return data;
    } catch (error) {
      console.error(error);
    }
}

const findPhotos = e => {
  e.preventDefault();
  const searchPhoto = input.value;
  gallery.innerHTML = '';
  pageNr = 1;
  buttonLoadMore.className = 'load-more-hidden';
  toggle.removeEventListener('click', toggleHandler);
  toggle.addEventListener('click', toggleHandlerInformation);
  getPhotos(searchPhoto, pageNr).then(data => {
    const totalHits = data.totalHits;
    if (data.hits.length === 0) {
      return Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again'
      );
    } else if (data.hits.length === data.total) {
      Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      foundedPhotos(data.hits);
    } else if (data.hits.length < 40 && data.hits.length > 0) {
      Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
      foundedPhotos(data.hits);
    } else if (toggle.classList.contains('active')) {
      Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
      toggle.addEventListener('click', toggleHandler);
      toggle.removeEventListener('click', toggleHandlerInformation);

      foundedPhotos(data.hits);
    } else {
      buttonLoadMore.className = 'load-more';
      Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
      toggle.addEventListener('click', toggleHandler);
      toggle.removeEventListener('click', toggleHandlerInformation);
      foundedPhotos(data.hits);
    }
  });
};

const showMorePhotos = e => {
  const searchPhoto = input.value;
  pageNr++;
  getPhotos(searchPhoto, pageNr).then(data => {
    if (data.hits.length < 40) {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      buttonLoadMore.className = 'load-more-hidden';
      foundedPhotos(data.hits);
    }
    if (pageNr == 13) {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      foundedPhotos(data.hits);
    } else {
      foundedPhotos(data.hits);
      const { height: cardHeight } =
        gallery.firstElementChild.getBoundingClientRect();
      window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
    }
  });
};

const foundedPhotos = data => {
  const images = data
    .map(
      image =>
        `<div class="photo-card">
      <a href="${image.largeImageURL}"><img class="image-preview" src="${image.webformatURL}" alt="${image.tags}" loading="lazy"/></a>
      <div class="info-items">
      <p class="info-item"><b>Likes</b> </br> ${image.likes}</p>
      <p class="info-item"><b>Views</b></br> ${image.views}</p>
      <p class="info-item"><b>Comments</b></br> ${image.comments}</p>
      <p class="info-item"><b>Downloads</b></br> ${image.downloads}</p>
      </div>
        </div>`
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', images);
  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();
};

const scrollHandler = () => {
  if (
    window.scrollY + window.innerHeight + 1.5 >=
    document.documentElement.scrollHeight
  ) {
    showMorePhotos();
  }
};

const toggleHandler = () => {
  toggle.classList.toggle('active');

  if (toggle.classList.contains('active')) {
    text.innerHTML = 'ON';
    buttonLoadMore.className = 'load-more-hidden';
    window.addEventListener('scroll', scrollHandler);
  } else {
    text.innerHTML = 'OFF';
    buttonLoadMore.className = 'load-more';
    window.removeEventListener('scroll', scrollHandler);
  }
};

const toggleHandlerInformation = () => {
  Notiflix.Notify.warning("Sorry, but You don't need Infinite scroll");
};
const scrollFunction = () => {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    buttonToTop.style.display = 'block';
  } else {
    buttonToTop.style.display = 'none';
  }
};

const topFunction = () => {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
};

window.onscroll = () => {
  scrollFunction();
};

buttonSearch.addEventListener('click', findPhotos);
buttonLoadMore.addEventListener('click', showMorePhotos);
buttonToTop.addEventListener('click', topFunction);
toggle.addEventListener('click', toggleHandlerInformation);
