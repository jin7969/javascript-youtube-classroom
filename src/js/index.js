import '../css/index.css';
import '../assets/images/not_found.png';
import MainScreen from './views/mainScreen.js';
import SearchResultScreen from './views/searchResultScreen.js';

const mainScreen = new MainScreen();
new SearchResultScreen(mainScreen);
