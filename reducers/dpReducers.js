import { combineReducers } from 'redux';
import {fromJS} from 'immutable';
import { routerReducer } from 'react-router-redux';
import { convertToUnFlattenJson } from '../util/utility';
import { UPDATE_SIDEBAR, CHANGE_NAV, RECEIVE_DETAIL_PAGE, REQUEST_NAV_CHANGE, RECEIVE_NAV_CHANGE, REQUEST_VERSION_CHANGE, RECEIVE_VERSION_CHANGE, CHANGE_DEFAULT_SIDEBAR, CHANGE_SDK_SIDEBAR, CHANGE_DEMO_SIDEBAR, CHANGE_FAQ_SIDEBAR, RECEIVE_CONFIG, NAVIGATION_CHANGE, UPDATE_CONTACT, RECEIVE_SEARCH_RESULT, RECEIVE_FAQ_RESULT, UPDATE_SEARCH_OPTION, UPDATE_COMMENT_STATUS, FETCH_SEARCH_RESULT, UPDATE_VERSION_SWITCHER_STATUS, UPDATE_FEEDBACK_STATUS } from '../actions/dpActions';

function articleInfo(state={
    lang: '',
    navPage: 'quickstart',
    version: '',
    detailPage: '',
    isContactExpand: false,
    allVersions: [],
    showSearchPage: false,
    isFaq: false
}, action) {
    switch (action.type) {
        case REQUEST_NAV_CHANGE:
            return Object.assign({}, state, {
                navPage: action.nav
            });
        case NAVIGATION_CHANGE:
            return Object.assign({}, state, action.articleInfo);
        case REQUEST_VERSION_CHANGE:
            return Object.assign({}, state, {
                version: action.version
            });
        case RECEIVE_CONFIG:
            return Object.assign({}, state, {
                lang: action.lang,
                allVersions: action.allVersions,
                version: action.version
            });
        case UPDATE_CONTACT:
            return Object.assign({}, state, {
                isContactExpand: action.isContactExpand
            });
        case RECEIVE_SEARCH_RESULT:
            return Object.assign({}, state, {
                showSearchPage: true,
                isFaq: action.isFaq
            });
        default:
            return state;
    }
}

function articlePosts(state = {
    isFetching: false,
    hasError: false,
    items: {
        category: [],
        data: []
    },
    noCategoryData: {},
    isDetailPage: false,
    isNoCategoryPage: false,
    detailHtml: '',
    lastUpdated: ''
}, action) {
    switch (action.type) {
        case REQUEST_NAV_CHANGE:
        case REQUEST_VERSION_CHANGE:
            return Object.assign({}, state, {
               isFetching: true,
                hasError: false
            });
        case RECEIVE_NAV_CHANGE:
        case RECEIVE_VERSION_CHANGE:
            return Object.assign({}, state, {
                isFetching: false,
                hasError: false,
                items: action.posts,
                isDetailPage: false,
                lastUpdated: action.receivedAt
            });
        case NAVIGATION_CHANGE:
            let navState = {
                isFetching: false,
                hasError: false,
                isDetailPage: action.hasDetailPage || false,
                isNoCategoryPage: action.hasNoCategory || false,
                lastUpdated: action.receivedAt
            };
            if (action.hasDetailPage && !action.hasNoCategory) {
                navState.detailHtml = action.posts;
                return Object.assign({}, state, navState);
            } else if (!action.hasDetailPage && !action.hasNoCategory) {
                navState.items = action.posts;
                navState.detailHtml = '';
                let stateCopy = fromJS(state);
                let newState = stateCopy.updateIn(['items', 'category'], (catList) => {
                    catList = action.posts.category;
                    return catList;
                });

                newState = newState.updateIn(['items', 'data'], (dataList) => {
                    dataList = action.posts.data;
                    return dataList;
                });

                newState = newState.set('isDetailPage', false);
                newState = newState.set('detailHtml', '');
                newState = newState.set('isNoCategoryPage', action.hasNoCategory);
                newState = newState.set('noCategoryData', {});

                return newState.toJS();
            } else if (action.hasNoCategory) {
                let downloadData = action.posts;
                if (action.articleInfo.navPage === 'sdk') {
                    downloadData = convertToUnFlattenJson(action.posts);
                }
                navState.noCategoryData = downloadData;
                return Object.assign({}, state, navState);
            }

        case RECEIVE_DETAIL_PAGE:
            return Object.assign({}, state, {
                isFetching: false,
                hasError: false,
                detailHtml: action.html,
                isDetailPage: true
            });
        case UPDATE_SIDEBAR:
            let map = fromJS(state);
            let updatedState = map.updateIn(['items', 'category'], (catList) => {
                let listToChange = catList.clear();
                listToChange = listToChange.push(action.detailCategories);
                return listToChange;
            });
            return updatedState.toJS();
        default:
            return state;
    }
}

function sidebarSelected(state={
    default: {
        product: [],
        platform: [],
        component: []
    },
    sdk: {
        product: []
    },
    demo: {
        product: []
    },
    faq: {
        category: []
    }
}, action) {
    let sidebarPage = 'default';
    switch (action.type) {
        case CHANGE_DEFAULT_SIDEBAR:
            sidebarPage = 'default';
            break;
        case CHANGE_SDK_SIDEBAR:
            sidebarPage = 'sdk';
            break;
        case CHANGE_DEMO_SIDEBAR:
            sidebarPage = 'demo';
            break;
        case CHANGE_FAQ_SIDEBAR:
            sidebarPage = 'faq';
            break;
        default:
            return state;
    }

    let map = fromJS(state);

    const key = action.changedItem.categoryName;
    let updatedState = map.updateIn([sidebarPage, key], (catItem) => {
        if(action.changedItem.item.itemName === 'all') {
            catItem = [];
        } else if(action.changedItem.item.isChecked) {
            catItem = catItem.push(action.changedItem.item.itemName);
        } else {
            let itemPos = catItem.indexOf(action.changedItem.item.itemName);
            if(itemPos > -1) {
                catItem = catItem.splice(itemPos, 1);
            }
        }
        return catItem;
    });
    return updatedState.toJS();
}

function searchResult(state={
    result: {},
    loading: false
}, action) {
    switch(action.type) {
        case RECEIVE_SEARCH_RESULT:
            return Object.assign({}, state, {
                result: action.searchResult,
                loading: false
            });
        case FETCH_SEARCH_RESULT:
            return Object.assign({}, state, {
                loading: true
            });
        default:
            return state;
    }
}

function searchOption(state={
    version: '',
    keyword: ''
}, action) {
    switch(action.type) {
        case UPDATE_SEARCH_OPTION:
            return Object.assign({}, state, {
                version: action.version
            });
        case RECEIVE_SEARCH_RESULT:
            return Object.assign({}, state, {
                keyword: action.keyword
            });
        default:
            return state;
    }
}

function faqResult(state={
    billing: {},
    faq: {},
    troubleshooting: {},
    errorcode: {}
}, action) {
    switch(action.type) {
        case RECEIVE_FAQ_RESULT:
            return Object.assign({}, state, {
                [action.keyword]: action.faqResult
            });
        default:
            return state;
    }
}

function commentStatus(state={
    status: 'init'
}, action) {
    switch(action.type) {
        case UPDATE_COMMENT_STATUS:
            return Object.assign({}, state, {
                status: action.status
            });
        default:
            return state;
    }
}

function oldversionPopup(state={
    showPopup: false,
    feedbackstatus: 'init'
}, action) {
    switch(action.type) {
        case UPDATE_VERSION_SWITCHER_STATUS:
            return Object.assign({}, state, {
                showPopup: action.showPopup
            });
        case UPDATE_FEEDBACK_STATUS:
            return Object.assign({}, state, {
                feedbackstatus: action.feedbackstatus
            });
        default:
            return state;
    }
}

const dpReducers = combineReducers({
    articleInfo,
    articlePosts,
    sidebarSelected,
    searchResult,
    faqResult,
    searchOption,
    commentStatus,
    oldversionPopup,
    routing: routerReducer
});

export default dpReducers;