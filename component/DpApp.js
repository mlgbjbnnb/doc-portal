import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import 'whatwg-fetch';
import { viewDetail, changeSidebar, getConfig, changeNavigation, updateSidebar, setSearchOption } from '../actions/dpActions';
import { browserHistory } from 'react-router';
import {injectIntl, intlShape} from 'react-intl';
import styles from '../style/theme.scss';
import Sidebar from './Sidebar';
import DpArticle from './DpArticle';
import DpHeader from './DpHeader';
import DpFaq from './DpFaq';
import DpSearchList from './DpSearchList';
import DpBackToOld from './DpBackToOld';
import DpBackToOldPopup from './DpBackToOldPopup';

class DpApp extends Component {
    constructor(props) {
        super(props);
        this.render = this.render.bind(this);
    }

    componentWillMount() {
        this.props.dispatch(getConfig(this.props.articleInfo.lang)).then(() => {
            return this.props.dispatch(changeNavigation(this.props.articleInfo));
        }).then(() => {
            return this.props.dispatch(setSearchOption(this.props.articleInfo.version));
        }).then(() => {
            let paths = this.props.location.pathname.split('/');
            if (paths.length <= 4 && !this.props.articleInfo.isFaq) {
                browserHistory.push(`/${this.props.articleInfo.lang}/${this.props.articleInfo.version}/${this.props.articleInfo.navPage}`);
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location.pathname !== this.props.location.pathname) {
            if(window.ga) {
                window.ga('send', 'pageview', location.pathname);
            }
            if(window._hmt) {
                window._hmt.push(['_trackPageview', location.pathname]);
            }
            nextProps.dispatch(changeNavigation(nextProps.articleInfo));
        }
    }

    componentDidUpdate(prevProps) {
        if ( this.props.articleInfo.navPage === 'sdk'
            && Object.prototype.toString.call(prevProps.articlePosts.noCategoryData) === '[object Object]'
            && Object.prototype.toString.call(this.props.articlePosts.noCategoryData) === '[object Array]' ) {
            let sdkCategories = {};
            sdkCategories.children = [];
            sdkCategories.name = 'product';
            sdkCategories.title = this.props.intl.formatMessage({
                id: 'sdk.product',
                defaultMessage: 'Product'
            });
            this.props.articlePosts.noCategoryData.map((sdkItem) => {
                sdkCategories.children.push({
                    name: sdkItem.title.content,
                    title: sdkItem.title.content
                });
            });
            this.props.dispatch(updateSidebar(sdkCategories));
        } else if ( this.props.articleInfo.navPage === 'demo' && !prevProps.articlePosts.noCategoryData.data && this.props.articlePosts.noCategoryData.data ) {
            let demoCategories = {};
            demoCategories.children = [];
            demoCategories.name = 'product';
            //demoCategories.title = 'product';
            demoCategories.title = this.props.intl.formatMessage({
                id: 'demo.product',
                defaultMessage: 'Product'
            });
            this.props.articlePosts.noCategoryData.data.demo_group.map((grp) => {
                demoCategories.children.push({
                    name: grp.title.content,
                    title: grp.title.content
                });
            });
            this.props.dispatch(updateSidebar(demoCategories));
        }
    }

    filterContents(sidebarSelected, contents) {
        let product = sidebarSelected.default.product;
        let platform = sidebarSelected.default.platform;
        let components = sidebarSelected.default.component;
        let filteredData = null;
        if (!contents.isNoCategoryPage && this.props.articleInfo.isFaq) {
            let faqCategory = sidebarSelected.faq.category;
            filteredData = contents.items.data.filter((data) => {
                let categoryMatch = (faqCategory.length === 0) || faqCategory.some((categoryItem) => {
                    return (data.category && data.category.indexOf(categoryItem) !== -1);
                });
                return categoryMatch;
            });
        }
        if (!contents.isNoCategoryPage && (this.props.articleInfo.navPage !== 'sdk') && (this.props.articleInfo.nav !== 'demo') && (!this.props.articleInfo.isFaq)) {
                filteredData = contents.items.data.filter((data) => {
                    let productMatch = (product.length === 0) || product.some((productItem) => {
                        return (data.product && data.product.indexOf(productItem) !== -1);
                    });
                    let platformMatch = (platform.length === 0) || platform.some((platformItem) => {
                        return (data.platform && data.platform.indexOf(platformItem) !== -1);
                    });
                    let componentMatch = (components.length === 0) || !!data.component;

                    if (data.component && (components.length > 0)) {
                        componentMatch = components.some((compItem) => {
                            return ((!data.component) || (data.component.indexOf(compItem) !== -1));
                        });
                    }
                    return (productMatch && platformMatch && componentMatch);
                });
        }

        if (contents.isNoCategoryPage && this.props.articleInfo.navPage === 'sdk'
            && Object.prototype.toString.call(contents.noCategoryData) === '[object Array]') {
            product = sidebarSelected.sdk.product;
            filteredData = contents.noCategoryData.filter((data) => {
                let selected = (product.length === 0) || (product.indexOf(data.title.content) > -1);
                return selected;
            });
        }
        if (contents.isNoCategoryPage && this.props.articleInfo.navPage === 'demo'
            && contents.noCategoryData.data && Object.prototype.toString.call(contents.noCategoryData.data.demo_group) === '[object Array]') {
            filteredData = contents.noCategoryData.data.demo_group.filter((data) => {
                product = sidebarSelected.demo.product;
                let selected = (product.length === 0) || (product.indexOf(data.title.content) > -1);
                return selected;
            });
        }
        let contentsClone = fromJS(contents);
        let updatedContents = null;
        if (!contents.isNoCategoryPage && (this.props.articleInfo.navPage !== 'sdk') && (this.props.articleInfo.nav !== 'demo')) {
            updatedContents = contentsClone.updateIn(['items', 'data'], (dataList) => {
                let listToChange = dataList.clear();
                filteredData.map((data) => {
                    listToChange = listToChange.push(data);
                });
                return listToChange;
            });
        }

        if (contents.isNoCategoryPage && this.props.articleInfo.navPage === 'sdk'
            && Object.prototype.toString.call(contents.noCategoryData) === '[object Array]') {
            updatedContents = contentsClone.updateIn(['noCategoryData'], (dataList) => {
                let listToChange = dataList.clear();
                filteredData.map((data) => {
                    listToChange = listToChange.push(data);
                });
                return listToChange;
            });
        }

        if (contents.isNoCategoryPage && this.props.articleInfo.navPage === 'demo'
            && contents.noCategoryData.data && Object.prototype.toString.call(contents.noCategoryData.data.demo_group) === '[object Array]') {
            updatedContents = contentsClone.updateIn(['noCategoryData','data', 'demo_group'], (dataList) => {
                let listToChange = dataList.clear();
                filteredData.map((data) => {
                    listToChange = listToChange.push(data);
                });
                return listToChange;
            });
        }
        return updatedContents ? updatedContents.toJS() : contents;
    }

    render() {
        const { dispatch, articleInfo, articlePosts, sidebarSelected, searchResult, faqResult, searchOption, commentStatus, oldversionPopup } = this.props;

        let filteredContents = this.filterContents(sidebarSelected, articlePosts);
        let contentHtml = (<div className={styles.dpContent}>
            <Sidebar childDispatch={(actions) => {return dispatch(actions)}} key={articleInfo.navPage} sidebarSelected={sidebarSelected} articleInfo={articleInfo} config={articlePosts} onSidebarChange={(navPage, sidebarState) => {return dispatch(changeSidebar(navPage, sidebarState))}}/>
            <DpArticle childDispatch={(actions) => {return dispatch(actions)}} isFaq={articleInfo.isFaq} commentStatus={commentStatus} isContactExpand={articleInfo.isContactExpand} lang={articleInfo.lang} navPage={articleInfo.navPage} contents={filteredContents} versionList={articleInfo.allVersions} version={articleInfo.version} onChangeNavigation={(articleInfo) => {return dispatch(changeNavigation(articleInfo));}} onClickDetail={(url) => {dispatch(viewDetail(url))}} />
        </div>);
        return (
            <div className={`dp-${articleInfo.lang}-container`}>
                <DpBackToOld childDispatch={(actions) => {return dispatch(actions)}} articleInfo={articleInfo}/>
                <DpHeader searchOption={searchOption} childDispatch={(actions) => {return dispatch(actions)}} articleInfo={articleInfo} onChangeNav={ (navInfo) => { return dispatch(changeNavigation(navInfo)) } }/>
                { (!articleInfo.showSearchPage) && contentHtml }
                {/*{ (articleInfo.isFaq && !articlePosts.isDetailPage) && <DpFaq searchOption={searchOption} faqResult={faqResult} isContactExpand={articleInfo.isContactExpand} searchResult={searchResult} childDispatch={(actions) => {return dispatch(actions)}} articleInfo={articleInfo} versions={articleInfo.allVersions} defaultVersion={articleInfo.version}/> }*/}
                { articleInfo.showSearchPage && <DpSearchList childDispatch={(actions) => {return dispatch(actions)}} searchOption={searchOption} articleInfo={articleInfo} searchResult={searchResult}/> }
                <DpBackToOldPopup childDispatch={(actions) => {return dispatch(actions)}} articleInfo={articleInfo} oldversionPopup={oldversionPopup} />
            </div>
        );
    }
}

// DpApp.propTypes = {
//     categories: PropTypes.arrayOf(
//         PropTypes.shape({
//             text: PropTypes.string.isRequired
//         }).isRequired
//     ).isRequired,
//     contents: PropTypes.arrayOf(
//         PropTypes.shape({
//             text: PropTypes.string.isRequired
//         }).isRequired
//     ).isRequired
// }

const mapStateToProps = (state, ownProps) => {
    let lang = ownProps.params.lang;
    let version = ownProps.params.version || '';
    let navPage = ownProps.params.navPage || '';
    let detailPage = (ownProps.params.pageDir && (`${ownProps.params.pageDir}/${ownProps.params.pageUrl}`)) || '';
    let isFaq = (version === 'faq');
    if(detailPage !== '') {
        navPage = ownProps.params.pageDir;
    } else {
        navPage = (navPage === '') ? state.articleInfo.navPage : navPage;
    }
    if(isFaq) {
        navPage = '';
    }
    version = (version === '' || version === 'faq') ? state.articleInfo.version : version;
    //detailPage = (detailPage === '') ? state.articleInfo.detailPage : detailPage;
    //version = state.articleInfo.isFaq && 'faq';
    // if(state.articleInfo.isFaq) {
    //     version = 'faq';
    // }

    let initArticleInfo = Object.assign({}, state.articleInfo, {
        lang,
        version,
        navPage,
        detailPage,
        isFaq
    });

    let initArticlePosts = Object.assign({}, state.articlePosts, {
        isDetailPage: (detailPage !== ''),
        detailHtml: ((detailPage !== '') ? state.articlePosts.detailHtml : ''),
        isNoCategoryPage: (navPage === 'sdk' || navPage === 'demo')
    });

    return {
        articleInfo: initArticleInfo,
        articlePosts: initArticlePosts,
        // articlePosts: state.articlePosts,
        sidebarSelected: state.sidebarSelected,
        searchResult: state.searchResult,
        searchOption: state.searchOption,
        faqResult: state.faqResult,
        commentStatus: state.commentStatus,
        oldversionPopup: state.oldversionPopup
    }
}

// const mapDispatchToProps = (dispatch) => {
//     return {
//         onChangeNav: (nav) => dispatch( changeNav(nav) )
//     }
// }

export default connect(
    mapStateToProps
    // mapDispatchToProps
)(injectIntl(DpApp));