import React from 'react';
import styles from '../style/theme.scss';
import classNames from 'classnames';
import { findDOMNode } from 'react-dom';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';

export default class Searchbar extends React.Component {
    constructor(props) {
        super(props);
        this.render = this.render.bind(this);
        this.isVersionExpand = false;
        this.isSearchbarExpand = false;
    }

    toggleVersionBox() {
        this.isVersionExpand = !this.isVersionExpand;
        this.forceUpdate();
    }

    toggleSearchbar() {
        this.isSearchbarExpand = !this.isSearchbarExpand;
        this.forceUpdate();
    }

    collapseSearchbar() {
        this.isSearchbarExpand = false;
        this.forceUpdate();
    }

    collapseVersionBox() {
        this.isVersionExpand = false;
        this.forceUpdate();
    }

    handleKeyPress(evt) {
        if(evt.key === 'Enter') {
            //(!this.props.isFaqSearch) && browserHistory.push(`/${this.props.articleInfo.lang}/${this.props.articleInfo.version}/searchresult`);
            let keyword = findDOMNode(this.refs.searchbar).value;
            let version = (this.props.searchOption.version === '') ? this.props.defaultVersion : this.props.searchOption.version;
            this.props.onSearch(version, keyword);
        }
    }

    changeVersion(evt) {
        let version = evt.currentTarget.getAttribute('value');
        this.props.onChangeSearchVersion(version);
    }

    componentDidMount() {
        this.props.onChangeSearchVersion && this.props.onChangeSearchVersion(this.props.defaultVersion);
    }

    componentDidUpdate() {
        if(this.isSearchbarExpand){
            findDOMNode(this.refs.searchbar).focus();
        }
    }

    render() {
        const versionBoxClass = classNames({
            [styles.faqSearch]: this.props.isFaqSearch,
            [styles.searchbar]: true
        });
        const dropDownClass = classNames({
            [styles.showDropDown]: this.isVersionExpand
        });
        const indicatorClass = classNames({
            'triangle-indicator-down': !this.isVersionExpand,
            'triangle-indicator-up': this.isVersionExpand,
            [styles.indicatorDownPos]: !this.isVersionExpand,
            [styles.indicatorUpPos]: this.isVersionExpand
        });
        const searchIconClass = classNames({
            'hide': this.isSearchbarExpand,
            [styles.searchIcon]: true
        });
        const searchbarClass = classNames({
            'hide': !this.isSearchbarExpand
        });

        const versionList = this.props.versions && this.props.versions.map((version, index) => {
            return (<li key={`${version}_${index}`} value={version} onClick={(evt) => {this.changeVersion(evt)}}>
                        <FormattedMessage
                            id="Product version"
                            defaultMessage="Product version {ver}"
                            values={{ver: version}}/>
                    </li>);
        }, this);
        const multiselectList = this.props.defaultVersion &&
            (<ul className={dropDownClass}><div className={styles.dropDownTitle}>
                <FormattedMessage
                    id="Choose version"
                    defaultMessage="选择版本"/>
            </div>{versionList}</ul>);
        const dropboxIndicator = this.props.defaultVersion && (<span className={indicatorClass}></span>);
        const multiselectBox = this.props.defaultVersion &&
            (<div className={styles.faqVersionBox} tabIndex="0" onClick={() => {this.toggleVersionBox()}} onBlur={() => {this.collapseVersionBox()}}>
                <span>
                    <FormattedMessage
                        id="Product version"
                        defaultMessage="Product version {ver}"
                        values={{ver: ( (this.props.searchOption.version === '') ? this.props.defaultVersion : this.props.searchOption.version )}}/>
                    {dropboxIndicator}
                </span>
                {multiselectList}
            </div>);
        return (
            <div className={versionBoxClass}>
                <span className={searchIconClass} onClick={() => {this.toggleSearchbar()}}></span>
                <input className={searchbarClass} tabIndex="0" ref="searchbar" id="search-bar" type="text" placeholder="Search" list="versions" onKeyPress={(evt) => {this.handleKeyPress(evt)}} onBlur={() => {this.collapseSearchbar()}}/>
            </div>
        );
    }
}