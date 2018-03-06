import React from 'react';
import styles from '../style/theme.scss';
import classNames from 'classnames';
import {makeSearch} from '../actions/dpActions';
import { FormattedMessage } from 'react-intl';

export default class DpSearchList extends React.Component {
    constructor(props) {
        super(props);
        this.render = this.render.bind(this);
    }

    changePagination(pageNum) {
        this.props.childDispatch(makeSearch(false, this.props.articleInfo.lang, this.props.searchOption.version, this.props.searchOption.keyword, pageNum));
    }

    render() {
        const searchResultHeader = <div className={styles.searchKeywordTitle}>
            <FormattedMessage
                id="search.result.title"
                defaultMessage="搜索"/>
            <span className={styles.keywordText}>{this.props.searchOption.keyword}</span></div>;
        const loadingBar = (<div className={this.props.searchResult.loading ? "loadingIcon" : ""}></div>);
        const searchListHTML = this.props.searchResult.result.data && this.props.searchResult.result.data.list.map((result, index) => {
                return (<a key={index} className={styles.searchItem} href={result.url} target="_blank">
                    <div className={styles.searchTitle} dangerouslySetInnerHTML={{ __html: result.title }}></div>
                    <div className={styles.searchContent} dangerouslySetInnerHTML={{ __html: result.content }}></div>
                </a>);
            });
        const totalPage = this.props.searchResult.result.data.total;
        const currentPage = this.props.searchResult.result.data.page;
        let pageNums = [];

        for(let index = 0; index < totalPage; index++) {
            pageNums.push(<span className={( (index + 1) === currentPage ) && styles.currentPage} key={index+1} href="" onClick={() => {this.changePagination(index+1)}}>{index+1}</span>);
        }
        return (
            <div>
                <div className={styles.searchResultContainer}>
                    {searchResultHeader}
                    {loadingBar}
                    {searchListHTML}
                </div>
                <div className={styles.pagination}>
                    {pageNums}
                </div>
            </div>
        );
    }
}