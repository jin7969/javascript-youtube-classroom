import { VIDEO, STORAGE_KEY } from '../constants/constants.js';

const storage = {
  setLocalStorage(video) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(video));
  },
  getLocalStorage() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  },
  updateLocalStorage(savedVideoData, videoData) {
    if (savedVideoData.length > VIDEO.MAX_SAVE_COUNT) {
      return;
    }
    if (this.isIncludeStorage(savedVideoData, videoData.videoId)) {
      return;
    }
    this.setLocalStorage([...savedVideoData, videoData]);
  },
  saveVideo(videoData) {
    const savedVideoData = this.getLocalStorage();
    if (savedVideoData) {
      this.updateLocalStorage(savedVideoData, videoData);
      return;
    }
    this.setLocalStorage([videoData]);
  },
  resetLocalStorage() {
    localStorage.clear();
  },
  isIncludeStorage(savedVideoData, target) {
    return savedVideoData.some((video) => video.videoId === target);
  },
};

export default storage;
