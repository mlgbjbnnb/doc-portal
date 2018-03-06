import React from 'react';
import styles from '../style/theme.scss';
import classNames from 'classnames';
import {changeNavigation, setSearchOption} from '../actions/dpActions';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';

export default class DpToolbar extends React.Component {
    constructor(props) {
        super(props);
        this.render = this.render.bind(this);
        this.expandVersionBox = this.expandVersionBox.bind(this);
        this.collapseVersionBox = this.collapseVersionBox.bind(this);
        this.toggleVersionBox = this.toggleVersionBox.bind(this);
        this.isVersionBoxExpand = false;
    }

    toggleVersionBox() {
        this.isVersionBoxExpand = !this.isVersionBoxExpand;
        this.forceUpdate();
    }
    expandVersionBox() {
        this.isVersionBoxExpand = true;
        this.forceUpdate();
    }
    collapseVersionBox() {
        this.isVersionBoxExpand = false;
        this.forceUpdate();
    }

    changeVersion(version) {
        this.props.onChangeNavigation({
            lang: this.props.lang,
            version,
            navPage: this.props.navPage,
        }).then(() => {
            this.props.childDispatch(setSearchOption(version));

            browserHistory.push(`/${this.props.lang}/${version}/${this.props.navPage}`);
        });
    }

    changeNavigation(navConfig) {
        const legacyVersions = ['1.10', '1.11'];
        if(legacyVersions.indexOf(navConfig.version) > -1) {
            location.href = `https://docs.agora.io/${navConfig.lang}/${navConfig.version}/index.html`;
        } else {
            this.props.childDispatch(changeNavigation(navConfig)).then(() => {
                browserHistory.push(`/${navConfig.lang}/${navConfig.isFaq ? 'faq' : navConfig.version}/${navConfig.navPage}`);
            });
        }
    }

    render() {
        const versionBoxClass = classNames({
            [styles.expand]: this.isVersionBoxExpand,
            [styles.versionBox]: true
        });

        const triangleIndClass = classNames({
            'triangle-indicator-down': !this.isVersionBoxExpand,
            'triangle-indicator-up': this.isVersionBoxExpand
        });

        let breadcumb;
        if (this.props.isDetailPage) {
            let navConfig = {
                lang: this.props.lang,
                version: this.props.version,
                navPage: this.props.navPage,
                detailPage: '',
                isFaq: this.props.isFaq
            }
            breadcumb = (<div className={styles.breadcumb}>
                <span className={styles.sep}>&gt;</span>
                <span className={styles.clickable} onClick={() => {this.changeNavigation(navConfig)}}>
                    <FormattedMessage
                        id={this.props.isFaq ? 'FAQ' : this.props.navPage}
                        defaultMessage={this.props.isFaq ? 'FAQ' : this.props.navPage}/>
                </span>
                <span className={styles.sep}>&gt;</span>
                <span>{this.props.title}</span>
            </div>);
        }
        let versionBoxDropDown = (!this.props.isFaq) ? (
                <div className={versionBoxClass} tabIndex="0" onClick={this.toggleVersionBox} onBlur={this.collapseVersionBox}>
                    <div className={styles.currentVersion}>
                        <FormattedMessage
                            id="Product version"
                            defaultMessage="Product version {ver}"
                            values={{ver: this.props.version}}/>
                        <i className={triangleIndClass}></i>
                    </div>
                    <ul>
                        <li>
                            <FormattedMessage
                                id="Choose version"
                                defaultMessage="选择版本"/>
                        </li>
                        {
                            this.props.versionList.map((version, index) => {
                                let versionConfig = {
                                    lang: this.props.lang,
                                    version: version,
                                    navPage: this.props.navPage,
                                    detailPage: (this.props.detailPage || '')
                                };
                                return (
                                    <li key={index} onClick={() => {this.changeNavigation(versionConfig)}}>
                                        <FormattedMessage
                                            id="Product version"
                                            defaultMessage='Product version {ver}'
                                            values={{ver: version}}
                                        />
                                    </li>
                                );
                            })
                        }
                        <li onClick={() => { location.href = 'https://docs.agora.io/'}}>
                            <FormattedMessage
                                id="versions.oldVersion"
                                defaultMessage="Older Version"/>
                        </li>
                    </ul>
                </div>
            ) : undefined;
        return (
            <div className={styles.toolbarContainer}>
                { versionBoxDropDown }
                { breadcumb }
            </div>
        );
    }
}