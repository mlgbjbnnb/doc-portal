import React from 'react';
import styles from '../style/backToOldPopup.scss';
import {injectIntl, FormattedMessage, intlShape} from 'react-intl';
import classNames from 'classnames';
import { findDOMNode } from 'react-dom';
import 'whatwg-fetch';
import {switchOldVersionPopup, updateFeedbackStatus} from '../actions/dpActions';

class DpBackToOldPopup extends React.Component {
    constructor(props) {
        super(props);
        this.render = this.render.bind(this);
        this.sendFeedback = this.sendFeedback.bind(this);
        this.cancelFeedback = this.cancelFeedback.bind(this);
        this.oldVersionLink = `https://docs.agora.io/${this.props.articleInfo.lang}/`;
    }

    sendFeedback(evt) {
        evt.preventDefault();
        if(this.popupCheckbox.checked) {
            localStorage.setItem('disable-popup', true);
        }
        let feedbackText = findDOMNode(this.refs.feedbackContent).value;
        //let emailValue = 'wuchanglong@agora.io';
        let formData = new FormData();

        formData.append('version', '');
        formData.append('doc_title', '');
        formData.append('origin_url', location.href);
        formData.append('original_context', '');
        formData.append('commenter_email', '');
        formData.append('content', feedbackText);

        fetch('//docs-feedback.wordpress-multisite-cn.agoralab.co/addfeedback/', {
            method: 'POST',
            body: formData
        }).then(() => {
            this.props.childDispatch(updateFeedbackStatus('complete'));
            setTimeout(() => {
                location.href = this.oldVersionLink;
            },2000);
        });
    }

    cancelFeedback() {
        if(this.popupCheckbox.checked) {
            localStorage.setItem('disable-popup', true);
        }
        location.href = this.oldVersionLink;
    }

    componentDidMount() {
        this.popupCheckbox = findDOMNode(this.refs.disablePopup);
    }

    render() {
        const submitText = this.props.intl.formatMessage({
            id: "feedback.popup.submit",
            defaultMessage: "提交"
        });
        const cancelText = this.props.intl.formatMessage({
            id: "feedback.popup.cancel",
            defaultMessage: "取消"
        });
        const feedbackPlaceholder = this.props.intl.formatMessage({
            id: "feedback.popup.placeholder",
            defaultMessage: 'Enter your comments here'
        });
        const showPopupClass = classNames({
            ["hide"]: !this.props.oldversionPopup.showPopup,
            [styles.popupDlg]: true
        });
        const popupFormClass = classNames({
            [styles.feedBackPopup]: true,
            ["hide"]: !(this.props.oldversionPopup.feedbackstatus === 'init')
        });
        const popupSuccessClass = classNames({
            [styles.feedbackSuccessContainer]: true,
            ["hide"]: !(this.props.oldversionPopup.feedbackstatus === 'complete')
        });
        const formElem = (
            <form className={popupFormClass} onSubmit={this.sendFeedback}>
                <div>
                    <textarea ref="feedbackContent" placeholder={feedbackPlaceholder}></textarea>
                </div>
                <div className={styles.bottomWidget}>
                    <div className={styles.checkboxContainer}>
                        <input id="disable-popup" type="checkbox" ref="disablePopup"/>
                        <label htmlFor="disable-popup">
                            <FormattedMessage
                                id="feedback.popup.checkbox"
                                defaultMessage="不再显示"/>
                        </label>
                    </div>
                    <div className={styles.buttonContainer}>
                        <input type="button" value={cancelText} onClick={this.cancelFeedback}/>
                        <input className={styles.activeBtn} type="submit" value={submitText}/>
                    </div>
                </div>
            </form>
        );

        const successElem = (
            <div className={popupSuccessClass}>
                <p>
                    <FormattedMessage
                        id="comment.thanks"
                        defaultMessage="Thanks for your comment"/>
                </p>
                <p>
                    <FormattedMessage
                        id="comment.feedback"
                        defaultMessage="We will process it ASAP"/>
                </p>
            </div>);
        return (
            <div className={showPopupClass}>
                {formElem}
                {successElem}
            </div>
        );
    }
}

DpBackToOldPopup.propTypes = {
    intl: intlShape.isRequired
}

export default injectIntl(DpBackToOldPopup);