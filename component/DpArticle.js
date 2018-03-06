import React from 'react';
import styles from '../style/theme.scss';
import DpToolbar from './DpToolbar';
import DpContact from './DpContact';
import { browserHistory } from 'react-router';
import { findDOMNode } from 'react-dom';
import { changeNavigation } from '../actions/dpActions';
import {updateSidebar, updateCommentStatus} from '../actions/dpActions';
import DpCommentDlg from './DpCommentDlg';
import 'whatwg-fetch';
import hljs from 'highlight.js';
import {throttle} from 'throttle-debounce';
import 'highlight.js/styles/arduino-light.css';

export default class DpArticle extends React.Component {
    constructor(props) {
        super(props);
        this.render = this.render.bind(this);
        this.handleScroll = throttle(100, this.handleScroll);
        this.handleScroll = this.handleScroll.bind(this);

        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleComment = this.handleComment.bind(this);
        this.sendComment = this.sendComment.bind(this);
        this.calculatePosition = this.calculatePosition.bind(this);
    }

    changeNavigation(articleInfo) {
        return this.props.onChangeNavigation(articleInfo);
    }

    gotoDetail(pageUrl) {
        this.props.childDispatch(changeNavigation({
            lang: this.props.lang,
            version: this.props.version,
            navPage: this.props.navPage,
            detailPage: pageUrl,
            isFaq: this.props.isFaq
        })).then(() => {
            let urlDetailList = pageUrl.split('/');
            let detailPage = urlDetailList.join('/');
            browserHistory.push(`/${this.props.lang}/${this.props.isFaq ? 'faq' : this.props.version}/${detailPage}`);
        });
    }

    handleScroll() {
        let scrollTop = findDOMNode(this.refs.detailContent).scrollTop;
        let overScrollList = Object.keys(this.offsetAnchorMap).filter((offsetTop) => {
            let anchorElem = this.contentElm.querySelectorAll('a[href="'+this.offsetAnchorMap[offsetTop]+'"]')[0];
            if(anchorElem.parentNode.tagName === 'H3') {
                let h3ContentTile = anchorElem.parentNode.parentNode;
                let h3ContentHeight = h3ContentTile.clientHeight;
                return ((scrollTop > (parseInt(offsetTop, 10))) && (scrollTop < (parseInt(offsetTop, 10) + h3ContentHeight)));
            }
            return ((scrollTop > (parseInt(offsetTop, 10) - 50)) && (scrollTop < (parseInt(offsetTop, 10) + 50)));
        });
        let latestLocation = overScrollList[0];
        if (latestLocation) {
            let hashValue = this.offsetAnchorMap[latestLocation];
            if(location.hash !== hashValue) {
                location.hash = hashValue;
            }
        }
    }

    preventDefault(e) {
        e = e || window.event;
        if (e.preventDefault)
            e.preventDefault();
        e.returnValue = false;
    }

    disableScroll() {
        window.onwheel = this.preventDefault;
        window.ontouchmove = this.preventDefault;
    }

    handleComment(evt) {
        let commentDlg = findDOMNode(this.refs.commentDlg);
        commentDlg.querySelectorAll('form')[0].reset();
        commentDlg.setAttribute('style', 'display: block;');
        let commentBox = document.querySelectorAll('.add-comment')[0];
        let commentLeft = commentBox.offsetLeft + 12;
        let commentTop = commentBox.offsetTop - this.contentElm.scrollTop + 30;
        let dialogHeight = commentTop + commentDlg.clientHeight;
        let contentHeight = this.contentElm.clientHeight - parseInt(getComputedStyle(this.contentElm).paddingBottom, 10);
        if(dialogHeight > contentHeight) {
            commentTop = commentBox.offsetTop - this.contentElm.scrollTop - commentDlg.clientHeight;
            commentDlg.setAttribute('style', `display: block;top:${commentTop}px;left:${commentLeft}px;`);
        } else {
            commentDlg.setAttribute('style', `display: block;top:${commentTop}px;left:${commentLeft}px;`);
        }
        this.disableScroll();
    }

    handleMouseOver(evt) {
        let targetElem = evt.target;
        let commentDlg = findDOMNode(this.refs.commentDlg);
        if(targetElem.tagName.toLowerCase() === 'p' && (window.getComputedStyle(commentDlg).display === 'none')) {
            let existingAddComment = this.contentElm.querySelectorAll('.add-comment')[0];
            existingAddComment && existingAddComment.removeEventListener('click', this.handleComment);
            existingAddComment && existingAddComment.remove();
            this.currentContext = targetElem.innerHTML;
            let addCommentElem = document.createElement('span');
            addCommentElem.setAttribute('class', 'add-comment');
            targetElem.parentNode.insertBefore(addCommentElem, targetElem);
            addCommentElem.addEventListener('click', this.handleComment);
        }
    }

    handleMouseOut(evt) {
        let targetElem = evt.target;
        if (targetElem.tagName.toLowerCase() === 'p') {
            let addcommentElem = targetElem.previousSibling;
            (addcommentElem.className === 'add-comment') && addcommentElem.remove();
        }
    }

    sendComment(content) {
        let articleTitle = document.querySelectorAll('#sidebar [class*="captionText"]')[0].innerHTML;
        let formData = new FormData();

        formData.append('version', this.props.version);
        formData.append('doc_title', articleTitle);
        formData.append('origin_url', location.href);
        formData.append('original_context', this.currentContext);
        formData.append('commenter_email', content.emailValue);
        formData.append('content', content.commentValue);

        fetch('//docs-feedback.wordpress-multisite-cn.agoralab.co/addfeedback/', {
            method: 'POST',
            body: formData
        }).then(() => {
            this.props.childDispatch(updateCommentStatus('complete'));
            setTimeout(() => {
                this.props.childDispatch(updateCommentStatus('init'));
                let commentDlg = findDOMNode(this.refs.commentDlg);
                commentDlg.setAttribute('style', 'display: none;');
                window.onwheel = null;
                window.ontouchmove = null;
            },2000);
        });
    }

    highLightCode(contentElem) {
        let codeBlocks = contentElem.querySelectorAll('pre');
        codeBlocks.forEach((code) => {
            hljs.highlightBlock(code);
        });
    }

    calculatePosition() {
        let titleList = Array.prototype.slice.call(this.contentElm.querySelectorAll('h2,h3'), 0);
        titleList.map((elem) => {
            let elemOffsetTop = elem.offsetTop - findDOMNode(this.refs.toolbar).clientHeight - parseInt(document.defaultView.getComputedStyle(elem).marginTop, 10);
            let hashTag = elem.getElementsByTagName('a')[0].getAttribute('href');
            this.offsetAnchorMap[elemOffsetTop] = hashTag;
        }, this);
    }

    componentDidUpdate(prevProps) {
          //if ( ((this.props.contents.items.category.length === 0 && this.props.contents.detailHtml !== '') || !prevProps.contents.isDetailPage) && this.props.contents.isDetailPage ) {
        //if ( (( this.props.contents.detailHtml !== '') || !prevProps.contents.isDetailPage) && this.props.contents.isDetailPage ) {
        if( ( (!prevProps.contents.isDetailPage) || (prevProps.contents.detailHtml === '')) && this.props.contents.isDetailPage && (this.props.contents.detailHtml !== '') ) {
                this.offsetAnchorMap = {};
                let detailCategories = {};
                if(document.querySelectorAll('h1 > a')[0]) {
                    let detailTitle = document.querySelectorAll('h1 > a')[0].previousSibling.nodeValue;
                    detailCategories.title = detailTitle;
                    detailCategories.showStep = true;
                    detailCategories.children = [];
                    Array.prototype.slice.call(document.querySelectorAll('h2 > a'), 0).map((elem) => {
                        let secondaryTitleList = elem.parentNode.parentNode.querySelectorAll('h3');
                        let sectionAnchor = {
                            name: elem.previousSibling.textContent,
                            anchor: elem.getAttribute('href'),
                            secondaryCategories: []
                        }
                        Array.prototype.slice.call(secondaryTitleList, 0).map((secondaryCategory) => {
                            let secondaryLink = secondaryCategory.querySelectorAll('a')[0];
                            let secondaryAnchor = secondaryLink.getAttribute('href');
                            let secondaryName = secondaryLink.previousSibling.nodeValue;
                            sectionAnchor.secondaryCategories.push({
                                name: secondaryName,
                                anchor: secondaryAnchor
                            });
                        });
                        detailCategories.children.push(sectionAnchor);
                    });
                    this.props.childDispatch(updateSidebar(detailCategories));
                    this.contentElm = findDOMNode(this.refs.detailContent);
                    this.highLightCode(this.contentElm);
                    let imagesLoaded = 0;
                    let images = this.contentElm.getElementsByTagName('img');
                    if(images.length > 0) {
                        Array.prototype.slice.call(images, 0).map((img) => {
                            img.onerror = img.onload = () => {
                                imagesLoaded++;
                                if(imagesLoaded === images.length) {
                                    this.calculatePosition();
                                }
                            }
                        });
                    } else {
                        this.calculatePosition();
                    }
                    this.contentElm.addEventListener('scroll', this.handleScroll);
                    this.contentElm.addEventListener('mouseover', this.handleMouseOver);
                }

                //this.contentElm.addEventListener('mouseout', this.handleMouseOut);

        }
    }

    componentWillUpdate(nextProps) {
        if( this.props.contents.isDetailPage && !nextProps.contents.isDetailPage ) {
            this.contentElm.removeEventListener('scroll', this.handleScroll);
            this.contentElm.removeEventListener('mouseover', this.handleMouseOver);
            //this.contentElm.removeEventListener('mouseout', this.handleMouseOut);
            delete this.contentElm;
            delete this.offsetAnchorMap;
        }
    }

    render() {
        let contentContainer;
        let articleTitle;
        if (this.props.contents.isDetailPage) {
            articleTitle = this.props.contents.items.category.map((catItem) => {
                return catItem.title
            });
        }
        let toolbarContainer = <DpToolbar ref="toolbar" isFaq={this.props.isFaq} childDispatch={(actions) => {return this.props.childDispatch(actions);}} isDetailPage={this.props.contents.isDetailPage} lang={this.props.lang} navPage={this.props.navPage} title={articleTitle} versionList={this.props.versionList} version={this.props.version} onChangeNavigation={(articleInfo) => {this.changeNavigation(articleInfo)}}/>;
        if ( !this.props.contents.isDetailPage && !this.props.contents.isNoCategoryPage ) {
            toolbarContainer = this.props.isFaq ? null : toolbarContainer;
            contentContainer = <div className={styles.contentContainer}>
                {
                    this.props.contents.items['data'].map((contentItem, index) => {
                        return (
                            <div key={index} className={styles.contentItem} onClick={() => {this.gotoDetail(`${contentItem.link}.html`)}}>
                                <div className={styles.contentItemTitle}>
                                    {contentItem.title}
                                </div>
                                <div className={styles.contentItemDesc}>
                                    {contentItem.description}
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        } else if ( this.props.contents.isDetailPage && !this.props.contents.isNoCategoryPage ){
            contentContainer = <div className={styles.contentContainer} dangerouslySetInnerHTML={{ __html: this.props.contents.detailHtml }} ref="detailContent"></div>;

        } else if ( this.props.contents.isNoCategoryPage ){
            toolbarContainer = null;
            contentContainer = <div className={styles.downloadContainer}>
                {
                    (this.props.navPage === 'demo') && this.props.contents.noCategoryData.data && this.props.contents.noCategoryData.data.demo_group.map((grp, index) => {
                        return (
                            <div key={`${grp.title.content}_${index}`} className={styles.demoGrp}>
                                <header>{grp.title.content}</header>
                                <div className={styles.demoSubtitle}>{grp.subtitle.content}</div>
                                <div className={styles.demos}>
                                    {
                                        grp.demos.map((demoItem, idx) => {
                                            if(demoItem.platform.title !== '') {
                                                return (
                                                    <div key={`${demoItem.platform.title}_${idx}`}>
                                                        <span className="width-15">{demoItem.platform.title}</span>
                                                        <span className="width-15">{demoItem.language.title}</span>
                                                        <a className="width-70" href={demoItem.link.content}
                                                           target="_blank">{demoItem.link.title}</a>
                                                    </div>
                                                )
                                            }
                                        })
                                    }
                                </div>
                            </div>
                        );
                    })
                }
                {
                    (this.props.navPage === 'sdk') && (Object.prototype.toString.call(this.props.contents.noCategoryData) === '[object Array]') && this.props.contents.noCategoryData.map((grp, index) => {
                        return (
                            <div key={`${grp.title.content}_${index}`} className={styles.sdkGrp}>
                                <header>{grp.title.content}</header>
                                <div className={styles.sdks}>
                                    {
                                        grp.platforms.map((platform, idx) => {
                                            if(platform.type.title !== '') {
                                                return (
                                                    <div key={`${platform.type.title}_${idx}`}>
                                                        <span className="width-15">{platform.type.title}</span>
                                                        <span className="width-15">{platform.version.content}</span>
                                                        <span className="width-15">{platform.releasedate.content}</span>
                                                        <a className="width-15" href={platform.releasenote.content}>{platform.releasenote.title}</a>
                                                        <a className="width-40" href={platform.downloadUrl.content}>{platform.downloadUrl.title}</a>
                                                    </div>
                                                )
                                            }
                                        })
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        }

        return (
            <div className={styles.articleContainer}>
                {toolbarContainer}
                {contentContainer}
                <DpCommentDlg ref="commentDlg" childDispatch={(actions) => {return this.props.childDispatch(actions);}} commentStatus={this.props.commentStatus} makeComment={(content) => {this.sendComment(content)}} />
                <DpContact lang={this.props.lang} isContactExpand={this.props.isContactExpand} childDispatch={(actions) => {return this.props.childDispatch(actions);}}/>
            </div>
        );
    }
}