import 'whatwg-fetch';
import {unflatten} from 'flat';

const zh_CN = require('../locale/zh_CN').default;
const en_US = require('../locale/en_US').default;

//Action Type=
export const ADD_COMMENT = 'ADD_COMMENT';
export const REQUEST_NAV_CHANGE = 'REQUEST_NAV_CHANGE';
export const RECEIVE_NAV_CHANGE = 'RECEIVE_NAV_CHANGE';
export const REQUEST_VERSION_CHANGE = 'REQUEST_VERSION_CHANGE';
export const RECEIVE_VERSION_CHANGE = 'RECEIVE_VERSION_CHANGE';
export const REQUEST_DETAIL_PAGE = 'REQUEST_DETAIL_PAGE';
export const RECEIVE_DETAIL_PAGE = 'RECEIVE_DETAIL_PAGE';
export const UPDATE_SIDEBAR = 'UPDATE_SIDEBAR';
export const UPDATE_CONTACT = 'UPDATE_CONTACT';
export const CHANGE_DEFAULT_SIDEBAR = 'CHANGE_DEFAULT_SIDEBAR';
export const CHANGE_SDK_SIDEBAR = 'CHANGE_SDK_SIDEBAR';
export const CHANGE_DEMO_SIDEBAR = 'CHANGE_DEMO_SIDEBAR';
export const CHANGE_FAQ_SIDEBAR = 'CHANGE_FAQ_SIDEBAR';
// export const CHECK_ALL_SIDEBAR = 'CHECK_ALL_SIDEBAR';
export const RECEIVE_CONFIG = 'RECEIVE_CONFIG';
export const NAVIGATION_CHANGE = 'NAVIGATION_CHANGE';
export const RECEIVE_SEARCH_RESULT = 'RECEIVE_SEARCH_RESULT';
export const RECEIVE_FAQ_RESULT = 'RECEIVE_FAQ_RESULT';
export const UPDATE_SEARCH_OPTION = 'UPDATE_SEARCH_OPTION';
export const UPDATE_COMMENT_STATUS = 'UPDATE_COMMENT_STATUS';
export const FETCH_SEARCH_RESULT = 'FETCH_SEARCH_RESULT';
export const UPDATE_VERSION_SWITCHER_STATUS = 'UPDATE_VERSION_SWITCHER_STATUS';
export const UPDATE_FEEDBACK_STATUS = "UPDATE_FEEDBACK_STATUS";

//Action Creator
function requestNavChange(nav) {
    return {
        type: REQUEST_NAV_CHANGE,
        nav
    }
}

function receiveNavChange(nav, json) {
    return {
        type: RECEIVE_NAV_CHANGE,
        nav,
        posts: json,
        receivedAt: Date.now()
    }
}

function requestVersionChange(version) {
    return {
        type: REQUEST_VERSION_CHANGE,
        version
    };
}

function receiveVersionChange(version, json) {
    return {
        type: RECEIVE_VERSION_CHANGE,
        version,
        posts: json,
        receivedAt: Date.now()
    };
}

function navigationChange(response, pageInfo, articleInfo) {
    return {
        type: NAVIGATION_CHANGE,
        posts: response,
        hasDetailPage: pageInfo.hasDetailPage || false,
        hasNoCategory: pageInfo.hasNoCategory || false,
        articleInfo,
        receivedAt: Date.now()
    }
}

function requestDetailPage(detailUrl) {
    return {
        type: REQUEST_DETAIL_PAGE
    };
}

function receiveDetailPage(detailUrl, html) {
    return {
        type: RECEIVE_DETAIL_PAGE,
        html
    };
}

function receiveSearchResult(isFaq, keyword, searchResult) {
    return {
        type: RECEIVE_SEARCH_RESULT,
        searchResult,
        keyword,
        isFaq
    }
}

function receiveFAQResult(keyword, faqResult) {
    return {
        type: RECEIVE_FAQ_RESULT,
        faqResult,
        keyword
    }
}

function receiveConfig(config) {

    return {
        type: RECEIVE_CONFIG,
        lang: config.lang,
        allVersions: config.versions,
        version: config.defaultVersion
    };
}

function fetchSearchResult() {
    return {
        type: FETCH_SEARCH_RESULT
    }
}

export function getConfig(lang) {
    return (dispatch) => {
        return fetch(`//${document.location.host}/${lang}/config.json`).then((response) => {
            return response.json();
        }).then((json) => {
            dispatch(receiveConfig(json));
        });
    }
}

export function changeVersion(version) {

    return (dispatch, getState) => {
        dispatch(requestVersionChange(version));
        return fetch(`/${getState().articleInfo.lang}/${version}/menu_${getState().articleInfo.navPage}.json`).then((response) => {
            return response.json();
        }).then((json) => {
            dispatch(receiveVersionChange(version, json));
        });
    };
}

export function changeNavigation(articleInfo) {
    let hasDetailPage = ((articleInfo.detailPage || false) && (articleInfo.detailPage !== ''));
    articleInfo.showSearchPage = false;

    let noCategoryPage = ['sdk','demo'];
    let hasNoCategory = noCategoryPage.indexOf(articleInfo.navPage) >= 0;

    // if (articleInfo.isFaq && !hasDetailPage ) {
    //     return {
    //         type: 'NOTHING'
    //     };
    // }

    return (dispatch) => {
        if (hasNoCategory) {
            let jsonName = articleInfo.navPage;
            if (articleInfo.navPage === 'sdk') {
                jsonName = 'product';
            }
            return fetch(`https://agora-website-public.oss-cn-hangzhou.aliyuncs.com/product_links/notice_${articleInfo.lang}_staging_${jsonName}_links.json`).then((response) => {
                return response.json();
            }).then((response) => {
                let responseObj = response;
                if (articleInfo.navPage === 'demo') {
                    responseObj = unflatten(response);
                }
                dispatch(navigationChange(responseObj, {
                    hasNoCategory
                }, articleInfo));
            });
        }
        if (hasDetailPage){
            return fetch(`/${articleInfo.lang}/${articleInfo.isFaq ? 'faq' : articleInfo.version}/_bare/${articleInfo.detailPage}`).then((response) => {
                return response.text();
            }).then((response) => {
                dispatch(navigationChange(response, {
                    hasDetailPage
                }, articleInfo));
            });
        } else {
            return fetch(`/${articleInfo.lang}/${articleInfo.isFaq ? 'faq' : articleInfo.version}/menu_${articleInfo.isFaq ? 'faq' : articleInfo.navPage}.json`).then((response) => {
                return response.json();
            }).then((response) => {
                dispatch(navigationChange(response, {
                    hasDetailPage
                }, articleInfo));
            });
        }
    };
}

export function changeNav(nav) {

    return (dispatch, getState) => {
        dispatch(requestNavChange(nav));
        return fetch(`/${getState().articleInfo.lang}/${getState().articleInfo.version}/menu_${nav}.json`).then((response) => {
            return response.json();
        }).then((json) => {
            dispatch(receiveNavChange(nav, json));
        });
    };
}

export function changeSidebar(navPage, changedItem) {
    let actionType = CHANGE_DEFAULT_SIDEBAR;
    switch(navPage) {
        case 'sdk':
            actionType = CHANGE_SDK_SIDEBAR;
            break;
        case 'demo':
            actionType = CHANGE_DEMO_SIDEBAR;
            break;
        case 'faq':
            actionType = CHANGE_FAQ_SIDEBAR;
            break;
        default:
            actionType = CHANGE_DEFAULT_SIDEBAR;
    }
    return {
        type: actionType,
        changedItem
    }
}

// export function checkAllSidebar() {
//     return (dispatch, getState) => {
//         let sidebarSelectedType = getState().articleInfo.isFaq ? 'faq' : 'default';
//         if (getState().articleInfo.navPage === 'sdk' || getState().articleInfo.navPage === 'demo') {
//             sidebarSelectedType = getState().articleInfo.navPage;
//         }
//         dispatch({
//             type: CHECK_ALL_SIDEBAR,
//             categoryList: getState().articlePosts.items.category,
//             sidebarType: sidebarSelectedType
//         });
//     }
// }

export function viewDetail(detailUrl) {

    return (dispatch, getState) => {
        dispatch(requestDetailPage(detailUrl));
        return fetch(`/${getState().articleInfo.lang}/${getState().articleInfo.version}//${detailUrl}`).then((response) => {
            return response.text();
        }).then((html) => {
            dispatch(receiveDetailPage(detailUrl, html));
        });
    };
}

export function updateSidebar( detailCategories ) {
    return {
        type: UPDATE_SIDEBAR,
        detailCategories
    }
}

export function updateContact( isContactExpand ) {
    return {
        type: UPDATE_CONTACT,
        isContactExpand
    }
}

export function addComment(comment) {
    return {
        type: ADD_COMMENT,
        comment
    }
}

export function setSearchOption(version) {
    return {
        type: UPDATE_SEARCH_OPTION,
        version
    }
}

export function makeSearch(isFaq, lang, version, keyword, page) {
    page = page || '1';
    let type = isFaq ? '4' : '1';
    let versionArg = isFaq ? '' : `&version=${version}`;
    return (dispatch) => {
        dispatch(fetchSearchResult());
        return fetch(`https://search.agora.io/search/result?kwd=${keyword}&lang=${lang}&type=${type}${versionArg}&count=10&page=${page}`).then((response) => {
            return response.json();
        }).then((result) => {
            dispatch(receiveSearchResult(isFaq, keyword, result));
        });
    }
}

export function fetchFAQ(lang, keyword) {
    let localeKeyword = (lang === 'cn') ? zh_CN[keyword] : en_US[keyword];
    return (dispatch) => {
        return fetch(`https://search.agora.io/search/result?kwd=${localeKeyword}&lang=${lang}&type=4&count=8`).then((response) => {
            return response.json();
        }).then((result) => {
            dispatch(receiveFAQResult(keyword, result));
        });
    };
}

export function updateCommentStatus(status) {
    return {
        type: UPDATE_COMMENT_STATUS,
        status
    }
}

export function switchOldVersionPopup(showPopup) {
    return {
        type: UPDATE_VERSION_SWITCHER_STATUS,
        showPopup
    }
}

export function updateFeedbackStatus(feedbackstatus) {
    return {
        type: UPDATE_FEEDBACK_STATUS,
        feedbackstatus
    }
}
