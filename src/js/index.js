import '../css/index.css';
import '../assets/images/not_found.png';
import MainScreen from './views/mainScreen.js';
import SearchResultModal from './views/searchResultModal.js';

const mainScreen = new MainScreen();
new SearchResultModal(mainScreen);
