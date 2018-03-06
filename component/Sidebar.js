import React from 'react';
import 'whatwg-fetch';
import styles from '../style/theme.scss';
import classNames from 'classnames';
import { findDOMNode } from 'react-dom';
import {FormattedMessage} from 'react-intl';

export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.render = this.render.bind(this);
        this.handleCategoryChange = this.handleCategoryChange.bind(this);
        this.hashChangehandler = this.hashChangehandler.bind(this);
    }

    componentDidMount() {
        window.addEventListener('hashchange', this.hashChangehandler, false);
    }

    componentDidUpdate() {
        if(this.props.config.isDetailPage) {
            let hashLink = document.querySelectorAll(`#sidebar a[href="${location.hash}"]`)[0];
            if (hashLink) {
                hashLink.click();
                hashLink.style.color = '#E9EFF4';
                hashLink.style.fontFamily = (this.props.articleInfo.lang === 'cn') ? 'Custom-Avenir, PingFangSC-Regular' : 'Avenir-Medium';
                hashLink.classList.remove('hide-bkg');
            }
        }
    }

    hashChangehandler() {
        let sidebarContainer = document.getElementById('sidebar');
        let sidebarHeight = parseInt(getComputedStyle(sidebarContainer, 0).height, 10);
        Array.prototype.slice.call(document.querySelectorAll('#sidebar a'), 0).map((link) => {
            link.classList.add('hide-bkg');
            link.removeAttribute('style');
        });
        let sidebarLink = document.querySelectorAll(`#sidebar a[href='${location.hash}']`)[0];
        if(sidebarLink) {
            sidebarLink.style.color = '#E9EFF4';
            sidebarLink.style.fontFamily = (this.props.articleInfo.lang === 'cn') ? 'Custom-Avenir, PingFangSC-Regular' : 'Avenir-Medium';
            let offsetTop = sidebarLink.offsetTop;
            let scrollTop = sidebarContainer.scrollTop;
            if((offsetTop - scrollTop) > sidebarHeight) {
                sidebarContainer.scrollTop = (scrollTop + sidebarHeight - 100);
            } else if((offsetTop - scrollTop) < 0) {
                sidebarContainer.scrollTop = offsetTop - 100;
            }
            sidebarLink && sidebarLink.classList.remove('hide-bkg');
        }
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.hashChangehandler, false);
    }

    handleCategoryChange(catId, categoryItemName, childItemName) {
        let catCheckBox = findDOMNode(this.refs[catId]);
        let catChecked = catCheckBox.checked;

        let categoryStatus = {
            categoryName: categoryItemName,
            item: {
                itemName: childItemName,
                isChecked: catChecked
            }
        };

        let currentNavPage = this.props.articleInfo.isFaq ? 'faq' : this.props.articleInfo.navPage;
        this.props.onSidebarChange(currentNavPage, categoryStatus);
    }

    render() {
        let sidebarSelectedType = this.props.articleInfo.isFaq ? 'faq' : 'default';
        if (this.props.articleInfo.navPage === 'sdk' || this.props.articleInfo.navPage === 'demo') {
            sidebarSelectedType = this.props.articleInfo.navPage;
        }

        const sidebarItemStyle = classNames({
            [styles.sidebarItem]: true,
            [styles[`sidebarItem-${this.props.articleInfo.lang}`]]: true
        });

        return (
            <div id="sidebar" className={styles.sidebar}>
                {
                    this.props.config.items.category.map((categoryItem, i) => {
                        let categoryTitleElem = (
                                <p className={styles.caption}>
                                    <span className={styles.captionText}>
                                        {categoryItem.title}
                                    </span>
                                </p>
                            );

                        let categoryChildrenElem;
                        if (!this.props.config.isDetailPage) {
                            let catItemAll = `cat_${categoryItem.name}_all`;
                            let allTag;
                            if(categoryItem.name !== 'component') {
                                allTag = (
                                    <li key={catItemAll} className={sidebarItemStyle}>
                                        <input checked={(this.props.sidebarSelected[sidebarSelectedType][categoryItem.name]) && (this.props.sidebarSelected[sidebarSelectedType][categoryItem.name].length === 0)} name={categoryItem.name} type="checkbox" ref={catItemAll} id={catItemAll} onChange={() => {this.handleCategoryChange(catItemAll, categoryItem.name, 'all')}} />
                                        <label htmlFor={catItemAll}>
                                            <FormattedMessage
                                                id="all"
                                                defaultMessage="所有"/>
                                        </label>
                                    </li>
                                );
                            }
                            categoryChildrenElem = (
                                <ul>
                                    {
                                        categoryItem.children.map((childItem, index) => {
                                            let catId = 'cat_' + categoryItem.name + index;
                                            let itemChecked = (this.props.sidebarSelected[sidebarSelectedType][categoryItem.name]) && (this.props.sidebarSelected[sidebarSelectedType][categoryItem.name].indexOf(childItem.name) !== -1);
                                            return (
                                                <li key={index} className={sidebarItemStyle}>
                                                    <input checked={itemChecked} name={categoryItem.name} type="checkbox" ref={catId} id={catId} onChange={() => {this.handleCategoryChange(catId, categoryItem.name, childItem.name)}} />
                                                    <label htmlFor={'cat_' + categoryItem.name + index}>{childItem.title}</label>
                                                </li>
                                            );
                                        })
                                    }
                                    {allTag}
                                </ul>
                            );
                        } else {
                            categoryChildrenElem = categoryItem.children.map((childItem, index) => {
                                let childNames = childItem.name.split(':');
                                let firstTitle = (<div key={index} className={styles.firstCategory}>
                                    <a href={childItem.anchor} className={`${styles.step} hide-bkg`}>
                                        <p>{childNames[0]}</p>
                                        <p>{childNames[1]}</p>
                                    </a>
                                </div>);

                                if (childItem.secondaryCategories && childItem.secondaryCategories.length > 0) {
                                    return (<div key={index} className={styles.categorySection}>
                                        {firstTitle}
                                        <ul>
                                            {
                                                childItem.secondaryCategories.map((secondaryItem, i) => {
                                                    return (<li key={i}>
                                                        <a href={secondaryItem.anchor} className="hide-bkg">{secondaryItem.name}</a>
                                                    </li>);
                                                })
                                            }
                                        </ul>
                                    </div>);
                                } else {
                                    return firstTitle;
                                }
                            })
                        }
                        return (
                            <div key={i} className={styles.sidebarCategory}>
                                {categoryTitleElem}
                                {categoryChildrenElem}
                            </div>
                        );
                    })
                }
            </div>
        );
    }
};