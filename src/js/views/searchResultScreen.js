import { $, $$ } from '../util/dom.js';
import YoutubeSearch from '../models/youtubeSearch.js';
import storage from '../storage/storage.js';
import { VIDEO } from '../constants/constants.js';
import { isEndOfScroll, scrollToTop } from '../util/general.js';

const searchTemplate = {
  skeletonUI: `
    <li class="skeleton">
      <div class="image"></div>
      <p class="line"></p>
      <p class="line"></p>
    </li>
  `,
  videoItem: (item) => {
    return `
      <li class="video-item" data-video-id='${item.id.videoId}'>
        <img
          src='${item.snippet.thumbnails.high.url}'
          alt="video-item-thumbnail"
          class="video-item__thumbnail"
        />
        <h4 class="video-item__title">${item.snippet.title}</h4>
        <p class="video-item__channel-name">${item.snippet.channelTitle}</p>
        <p class="video-item__published-date">${item.snippet.publishTime}</p>
        <button type="button" class="video-item__save-button button ${
          item.saved ? 'hide' : ''
        }">⬇ 저장</button>
      </li>
  `;
  },
  noResult: `
    <h3 hidden>검색 결과</h3>
    <div class="no-result">
      <img src="./assets/not_found.png" alt="no result image" class="no-result__image" />
      <p class="no-result__description">
        검색 결과가 없습니다<br />
        다른 키워드로 검색해보세요
      </p>
    </div>
  `,
};

export default class SearchResultScreen {
  constructor(mainScreen) {
    this.throttle = null;
    this.youtubeSearch = new YoutubeSearch();
    this.mainPage = mainScreen;

    this.modalContainer = $('.modal-container');
    this.searchModalButton = $('#search-modal-button');
    this.dimmer = $('.dimmer');
    this.searchButton = $('#search-button');
    this.videoList = $('.video-list');
    this.searchInputKeyword = $('#search-input-keyword');

    this.dimmer.addEventListener('click', this.toggleModal.bind(this));
    this.searchModalButton.addEventListener('click', this.toggleModal.bind(this));
    this.searchButton.addEventListener('click', this.handleSearch.bind(this));
    this.searchInputKeyword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSearch();
    });
    this.videoList.addEventListener('scroll', this.handleVideoListScroll.bind(this));
    this.videoList.addEventListener('click', (e) => {
      const isSaveButtonClick = e.target.classList.contains('video-item__save-button');
      if (isSaveButtonClick) {
        this.handleSaveVideo(e.target);
      }
    });
  }

  toggleModal() {
    this.modalContainer.classList.toggle('hide');
  }

  removeScrollEvent() {
    this.videoList.removeEventListener('scroll', this.handleVideoListScroll);
  }

  async handleSearch() {
    const searchInput = this.searchInputKeyword.value.trim();
    this.youtubeSearch.searchTarget = searchInput;
    this.youtubeSearch.pageToken = '';
    scrollToTop(this.videoList);
    this.resetVideoList();
    this.renderSkeletonUI();

    try {
      const response = await this.youtubeSearch.fetchYoutubeAPI();
      this.renderSearchResult(response);
    } catch (error) {
      alert(error.message);
    }
  }

  async handleVideoListScroll(e) {
    if (isEndOfScroll(e.target) && !this.throttle) {
      this.renderSkeletonUI();
      const response = await this.youtubeSearch.fetchYoutubeAPI();
      this.renderSearchResult(response);
      const isLastVideos = response.items.length !== 0 && !response.nextPageToken;
      if (isLastVideos) {
        this.removeScrollEvent();
      }
      this.throttle = setTimeout(() => {
        this.throttle = null;
      }, VIDEO.THROTTLE_DELAY);
    }
  }

  selectedVideoData(videoItem) {
    const videoData = {
      videoId: videoItem.dataset.videoId,
      thumbnails: videoItem.querySelector('.video-item__thumbnail').src,
      title: videoItem.querySelector('.video-item__title').textContent,
      channelTitle: videoItem.querySelector('.video-item__channel-name').textContent,
      publishTime: videoItem.querySelector('.video-item__published-date').textContent,
      unseen: true,
    };
    return videoData;
  }

  handleSaveVideo(selectedButton) {
    selectedButton.hidden = true;
    const videoData = this.selectedVideoData(selectedButton.closest('li'));
    storage.saveVideo(videoData);
    this.mainPage.renderSavedVideos(true, storage.getLocalStorage());
  }

  removeSkeletonUI() {
    $$('.skeleton').forEach((element) => element.remove());
  }

  renderVideoItems({ items }) {
    const savedStorage = storage.getLocalStorage();
    items.forEach((item) => {
      if (savedStorage && savedStorage.find((data) => data.videoId === item.id.videoId)) {
        item.saved = true;
      }
      this.videoList.insertAdjacentHTML('beforeEnd', searchTemplate.videoItem(item));
    });
  }

  renderSearchResult(videoData) {
    this.removeSkeletonUI();
    if (videoData.items.length === 0) {
      this.videoList.innerHTML = searchTemplate.noResult;
      return;
    }
    this.renderVideoItems(videoData);
  }

  resetVideoList() {
    this.videoList.replaceChildren();
  }

  renderSkeletonUI() {
    this.videoList.insertAdjacentHTML(
      'beforeEnd',
      searchTemplate.skeletonUI.repeat(VIDEO.SEARCH_RESULT_COUNT)
    );
  }
}
