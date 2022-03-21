import { $ } from '../util/dom.js';
import { MESSAGE } from '../constants/constants.js';
import storage from '../storage/storage.js';

const savedVideoTemplate = {
  noSaved: '<li class="no-saved-video">저장된 동영상이 없습니다.<li>',
  VideoItem: (item) => {
    return `
      <li class="video-item" data-video-id='${item.videoId}'>
        <img
          src='${item.thumbnails}'
          alt="video-item-thumbnail"
          class="video-item__thumbnail"
        />
        <h4 class="video-item__title">${item.title}</h4>
        <p class="video-item__channel-name">${item.channelTitle}</p>
        <p class="video-item__published-date">${item.publishTime}</p>
        <div class="video-manage-button">
          <button type="button" class="video-watched-button">✅</button>
          <button type="button" class="video-remove-button">🗑</button>
        </div>
      </li>
    `;
  },
};

export default class MainScreen {
  constructor() {
    this.isVideoState = true;

    this.unseenVideoButton = $('#unseen-video-button');
    this.watchedVideoButton = $('#watched-video-button');
    this.savedVideoList = $('.saved-video-list');

    this.unseenVideoButton.addEventListener('click', this.handleUnseenContent.bind(this));
    this.watchedVideoButton.addEventListener('click', this.handleWatchedContent.bind(this));
    this.savedVideoList.addEventListener('click', this.handleSavedVideoButton.bind(this));

    this.initSavedVideos();
  }

  changedVideoList(videoList) {
    storage.setLocalStorage(videoList);
    if (videoList.length === 0) {
      this.renderNoSaved();
      storage.resetLocalStorage();
      return;
    }
    this.renderSavedVideos(this.isVideoState, videoList);
  }

  handleDeleteVideo(selectedVideoId) {
    const deletedVideoList = storage
      .getLocalStorage()
      .filter((video) => video.videoId !== selectedVideoId);
    this.changedVideoList(deletedVideoList);
  }

  handleWatchedVideo(selectedVideoId) {
    const changedVideosState = storage.getLocalStorage().map((video) => {
      if (video.videoId === selectedVideoId) {
        video.unseen = !video.unseen;
      }
      return video;
    });
    this.changedVideoList(changedVideosState);
  }

  handleSavedVideoButton(e) {
    if (e.target.classList.contains('video-remove-button')) {
      if (window.confirm(MESSAGE.CONFIRM.CHECK_DELETE)) {
        const selectedVideoId = e.target.closest('li').dataset.videoId;
        this.handleDeleteVideo(selectedVideoId);
      }
    }
    if (e.target.classList.contains('video-watched-button')) {
      const selectedVideoId = e.target.closest('li').dataset.videoId;
      this.handleWatchedVideo(selectedVideoId);
    }
  }

  handleWatchedContent() {
    this.unseenVideoButton.classList.remove('target');
    this.watchedVideoButton.classList.add('target');
    this.isVideoState = false;
    this.initSavedVideos();
  }

  handleUnseenContent() {
    this.unseenVideoButton.classList.add('target');
    this.watchedVideoButton.classList.remove('target');
    this.isVideoState = true;
    this.initSavedVideos();
  }

  initSavedVideos() {
    const savedVideos = storage.getLocalStorage();
    if (!savedVideos) {
      this.renderNoSaved();
      return;
    }
    this.renderSavedVideos(this.isVideoState, savedVideos);
  }

  renderNoSaved() {
    this.savedVideoList.innerHTML = savedVideoTemplate.noSaved;
  }

  renderSavedVideos(state, savedVideos) {
    this.savedVideoList.replaceChildren();
    savedVideos.forEach((video) => {
      if (video.unseen === state) {
        this.savedVideoList.insertAdjacentHTML('beforeEnd', savedVideoTemplate.VideoItem(video));
      }
    });
    if (!this.savedVideoList.hasChildNodes()) {
      this.renderNoSaved();
    }
  }
}
