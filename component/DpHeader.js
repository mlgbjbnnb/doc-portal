import React from 'react';
import { Link } from 'react-router';
import styles from '../style/theme.scss';
import Searchbar from './Searchbar';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { makeSearch } from '../actions/dpActions';

export default class DpHeader extends React.Component {
    constructor(props) {
        super(props);
        this.render = this.render.bind(this);
        this.makeSearch = this.makeSearch.bind(this);
    }

    // handleNavChange(nav) {
    //     this.props.onChangeNav({
    //         lang: this.props.articleInfo.lang,
    //         version: this.props.articleInfo.version,
    //         navPage: nav,
    //         detailPage: ''
    //     });
    // }

    makeSearch(version, keyword) {
        this.props.childDispatch(makeSearch(false, this.props.articleInfo.lang, version, keyword));
    }

    render() {
        const navClass = classNames({
            [styles[`nav-${this.props.articleInfo.lang}`]]: true,
            [styles[`navFaq-${this.props.articleInfo.lang}`]]: (this.props.articleInfo.navPage === 'faq')
        });
        const rightNav = classNames({
            [styles[`menu-${this.props.articleInfo.lang}`]]: true
        });
        const faqNav = classNames({
            [styles[`activeNavItem-${this.props.articleInfo.lang}`]]: this.props.articleInfo.isFaq
        });
        return (
            <header className={styles.dpHeader}>
                <div className={styles.logoContainer}>
                    <a className={styles.logo} href="//www.agora.io" target="_blank"></a>
                </div>
                <div ref="nav" className={navClass}>
                        <Link className={(!this.props.articleInfo.isFaq && this.props.articleInfo.navPage === 'instruction') ? styles[`activeNavItem-${this.props.articleInfo.lang}`] : ''} to={`/${this.props.articleInfo.lang}/${this.props.articleInfo.version}/instruction/`} >
                            <FormattedMessage
                                id="product"
                                defaultMessage="产品说明"/>
                        </Link>
                        <Link className={(!this.props.articleInfo.isFaq && this.props.articleInfo.navPage === 'quickstart') ? styles[`activeNavItem-${this.props.articleInfo.lang}`] : ''} to={`/${this.props.articleInfo.lang}/${this.props.articleInfo.version}/quickstart/`}>
                            <FormattedMessage
                                id="quickstart"
                                defaultMessage="快速开始"/>
                        </Link>
                        <Link className={(!this.props.articleInfo.isFaq && this.props.articleInfo.navPage === 'guides') ? styles[`activeNavItem-${this.props.articleInfo.lang}`] : ''} to={`/${this.props.articleInfo.lang}/${this.props.articleInfo.version}/guides/`}>
                            <FormattedMessage
                                id="integration"
                                defaultMessage="集成指南"/>
                        </Link>
                        <Link className={(!this.props.articleInfo.isFaq && this.props.articleInfo.navPage === 'tutorial') ? styles[`activeNavItem-${this.props.articleInfo.lang}`] : ''} to={`/${this.props.articleInfo.lang}/${this.props.articleInfo.version}/tutorial/`}>
                            <FormattedMessage
                                id="tutorials"
                                defaultMessage="教程"/>
                        </Link>
                        <Link className={(!this.props.articleInfo.isFaq && this.props.articleInfo.navPage === 'api') ? styles[`activeNavItem-${this.props.articleInfo.lang}`] : ''} to={`/${this.props.articleInfo.lang}/${this.props.articleInfo.version}/api/`}>
                            <FormattedMessage
                                id="API Reference"
                                defaultMessage="API参考"/>
                        </Link>
                        <Link className={(!this.props.articleInfo.isFaq && this.props.articleInfo.navPage === 'sdk') ? styles[`activeNavItem-${this.props.articleInfo.lang}`] : ''} to={`/${this.props.articleInfo.lang}/${this.props.articleInfo.version}/sdk/`}>
                            <FormattedMessage
                                id="SDK Downloads"
                                defaultMessage="SDK下载"/>
                        </Link>
                        <Link className={(!this.props.articleInfo.isFaq && this.props.articleInfo.navPage === 'demo') ? styles[`activeNavItem-${this.props.articleInfo.lang}`] : ''} to={`/${this.props.articleInfo.lang}/${this.props.articleInfo.version}/demo/`}>
                            <FormattedMessage
                                id="Sample Code"
                                defaultMessage="代码示例"/>
                        </Link>
                        <Link className={faqNav} to={`/${this.props.articleInfo.lang}/faq/`}>
                            <FormattedMessage
                                id="FAQ"
                                defaultMessage="FAQ"/>
                        </Link>
                </div>
                <Searchbar defaultVersion={this.props.articleInfo.version} searchOption={this.props.searchOption} onSearch={(version, keyword) => {this.makeSearch(version, keyword)}} articleInfo={this.props.articleInfo} isFaqSearch={false}/>
                <div className={rightNav}>
                    <a href="//dashboard.agora.io" target="_blank" className={styles.navDashboard}>
                        <FormattedMessage
                            id="Dashboard"
                            defaultMessage="开发者后台"/>
                    </a>
                    <a href={`https://dev.agora.io/${this.props.articleInfo.lang}/`} target="_blank" className={styles.navForum}>
                        <FormattedMessage
                            id="Forum"
                            defaultMessage="论坛"/>
                    </a>
                </div>
                <div className={styles.langStyle}>
                    <a href={`/${(this.props.articleInfo.lang === 'cn') ? 'en' : 'cn'}/`}>{(this.props.articleInfo.lang === 'cn') ? 'English' : '中文'}</a>
                </div>
            </header>
        );
    }
}