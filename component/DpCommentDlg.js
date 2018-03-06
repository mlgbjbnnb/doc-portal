import React from 'react';
import styles from '../style/theme.scss';
import {injectIntl, FormattedMessage, intlShape} from 'react-intl';
import { findDOMNode } from 'react-dom';
import {updateCommentStatus} from '../actions/dpActions'

class DpCommentDlg extends React.Component {
    constructor(props) {
        super(props);
        this.render = this.render.bind(this);
        this.closeDlg = this.closeDlg.bind(this);
        this.makeComment = this.makeComment.bind(this);
    }

    enableScroll() {
        window.onwheel = null;
        window.ontouchmove = null;
    }

    closeDlg() {
        let commentDlg = findDOMNode(this.refs.commentDlg);
        commentDlg.setAttribute('style', 'display: none;');
        this.props.childDispatch(updateCommentStatus('init'));
        this.enableScroll();
    }

    makeComment(evt) {
        let emailBox = document.getElementById('user_email');
        let commentBox = document.getElementById('user_comment');
        let emailValue = emailBox.value;
        let commentValue = commentBox.value;
        let isInvalid = false;
        if( emailValue === '' ) {
            emailBox.setAttribute('style', 'border-color: red');
            isInvalid = true;
        } else {
            emailBox.style.borderColor = null;
        }
        if (commentValue === '') {
            commentBox.setAttribute('style', 'border-color: red');
            isInvalid = true;
        } else {
            commentBox.style.borderColor = null;
        }

        if(!isInvalid) {
            this.props.makeComment({
                emailValue,
                commentValue
            });
        }
        evt.preventDefault();
}

    render() {
        const emailPlaceHolder = this.props.intl.formatMessage({
            id: 'comment.email',
            defaultMessage: 'Input your email'
        });
        const commentPlaceHolder = this.props.intl.formatMessage({
            id: "comment.text",
            defaultMessage: "Input your comment here"
        });
        const submitText = this.props.intl.formatMessage({
            id: "comment.submit",
            defaultMessage: "Submit"
        });
        const formHtml = (<form className={styles.formContainer} onSubmit={this.makeComment}>
            <div>
                <input name="email" id="user_email" type="email" placeholder={emailPlaceHolder}/>
            </div>
            <div>
                <textarea name="comment" id="user_comment" placeholder={commentPlaceHolder}></textarea>
            </div>
            <div>
                <input type="submit" value={submitText}/>
            </div>
        </form>);
        const successHtml = (<div className={styles.commentSuccessContainer}>
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
        let commentHtml = (this.props.commentStatus.status === 'complete') ? successHtml : formHtml;
        return (<div className={styles.commentDlg} ref="commentDlg">
            <div className={styles.close} onClick={this.closeDlg}>+</div>
            {commentHtml}
        </div>);
    }
}

DpCommentDlg.propTypes = {
    intl: intlShape.isRequired
}

export default injectIntl(DpCommentDlg);