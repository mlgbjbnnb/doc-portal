import React from 'react';
import styles from '../style/theme.scss';
//let algoliasearch = require('algoliasearch');
import Searchbar from "./Searchbar";
import 'whatwg-fetch';
import {makeSearch, setSearchOption} from '../actions/dpActions';
import DpSearchList from './DpSearchList';
import DpFaqPush from './DpFaqPush';
import DpContact from './DpContact';

export default class DpFaq extends React.Component {
    constructor(props) {
        super(props);
        this.render = this.render.bind(this);
        this.faqTitles = ['billing', 'faq', 'troubleshooting', 'errorcode'];
        // this.searchClient = algoliasearch('6NC49524RB', '1acb5c2c6e66ba0fae8973f8f8c30a0d');
        // this.searchIndex = this.searchClient.initIndex('getstarted_actors');
    }

    makeSearch(version, keyword) {
        this.props.childDispatch(makeSearch(true, this.props.articleInfo.lang, version, keyword));
    }

    changeSearchVersion(version) {
        this.props.childDispatch(setSearchOption(version));
    }

    changePagination(pageNum) {
        this.props.childDispatch(makeSearch(true, this.props.articleInfo.lang, this.props.searchOption.version, this.props.searchOption.keyword, pageNum));
    }

    // componentDidMount() {
    //     this.searchIndex.search('monica', function searchDone(err, content) {
    //         if (err) {
    //             console.error(err);
    //             return;
    //         }
    //
    //         for (var h in content.hits) {
    //             console.log('Hit(' + content.hits[h].objectID + '): ' + content.hits[h].toString());
    //         }
    //     });
    // }

    render() {
        let faqPushListHtml = null;
        if (!this.props.articleInfo.showSearchPage) {
            faqPushListHtml = (<div className={styles.faqPushContainer}>
                {
                    this.faqTitles.map((title, index) => {
                        return (<DpFaqPush key={index} faqResult={this.props.faqResult} articleInfo={this.props.articleInfo} faqTitle={title} childDispatch={(actions) => {this.props.childDispatch(actions)}}/>);
                    })
                }
            </div>);
        }
        return (<div className={styles.dpSearchListContainer}>
            <div className={styles.searchWrapper}>
                <span>FAQ</span>
                <Searchbar searchOption={this.props.searchOption} onSearch={(version, keyword) => {this.makeSearch(version, keyword)}} onChangeSearchVersion={(version) => {this.changeSearchVersion(version)}} articleInfo={this.props.articleInfo} isFaqSearch={true} versions={this.props.versions} defaultVersion={this.props.defaultVersion}/>
            </div>
            {
                this.props.articleInfo.showSearchPage && <DpSearchList onChangePagination={(pageNum) => {this.changePagination(pageNum)}} articleInfo={this.props.articleInfo} searchResult={this.props.searchResult}/>
            }
            {
                !this.props.articleInfo.showSearchPage && faqPushListHtml
            }
            <DpContact isContactExpand={this.props.isContactExpand} childDispatch={(actions) => {return this.props.childDispatch(actions);}}/>
        </div>);
    }
}