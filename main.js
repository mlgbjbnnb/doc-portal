import React from 'react';
import ReactDOM from 'react-dom';
import DpApp from './component/DpApp';
import { Provider } from 'react-redux';
import dpReducers from './reducers/dpReducers';
import { createStore, applyMiddleware } from 'redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import zh_CN from './locale/zh_CN';
import en_US from './locale/en_US';
import zh from 'react-intl/locale-data/zh';
import en from 'react-intl/locale-data/en';
import { IntlProvider, addLocaleData } from 'react-intl';

const language =  location.pathname.split('/')[1];
let acceptLang = 'en-US';

addLocaleData([...zh, ...en]);
function chooseLocale() {
    let lang = en_US;
    switch(language) {
        case 'en':
            lang = en_US;
            acceptLang = 'en-US';
            break;
        case 'cn':
            lang = zh_CN;
            acceptLang = 'zh-CN';
            break;
        default:
            lang = en_US;
            acceptLang = 'en-US';
            break;
    }
    return lang;
}

//Store
const store = createStore(
    dpReducers,
    undefined,
    composeWithDevTools(
        applyMiddleware(
            thunk
        )
    )
);

const history = syncHistoryWithStore(browserHistory, store);

const DP_ROOT = document.getElementById('dev-portal');
ReactDOM.render((
    <IntlProvider locale={acceptLang} messages={chooseLocale()}>
        <Provider store={store}>
            <Router path="/" history={history}>
                <Route path="/:lang" component={DpApp}/>
                <Route path="/:lang/:version" component={DpApp}/>
                <Route path="/:lang/:version/:navPage" component={DpApp}/>
                <Route path="/:lang/:version/:pageDir/:pageUrl" component={DpApp}/>
            </Router>
        </Provider>
    </IntlProvider>
), DP_ROOT);
