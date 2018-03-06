import React from 'react';
import styles from '../style/theme.scss';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import {updateContact} from '../actions/dpActions';

export default class DpContact extends React.Component {
    constructor(props) {
        super(props);

    }

    toggleContact() {
        this.props.childDispatch(updateContact(!this.props.isContactExpand));
    }

    render() {
        const forumLink = `https://dev.agora.io/${this.props.lang}/`;
        const worksheetLink = `https://agora.kf5.com/hc/request/guest/${(this.props.lang === 'en') ? '?lang=en' : ''}`;

        const contactStatus = classNames({
            [styles.contactContainerExpand]: this.props.isContactExpand && (this.props.lang === 'cn'),
            [styles.contactContainerExpandEn]: this.props.isContactExpand && (this.props.lang === 'en'),
            [styles.contactContainerCollapse]: !this.props.isContactExpand
        });

        const hideForEnStyle = classNames({
            'hide': (this.props.lang === 'en')
        });
        // const contactLogo = classNames({
        //     [styles.contactLogoExpand]: this.props.isContactExpand,
        //     [styles.contactLogoCollapse]: !this.props.isContactExpand
        // });
        return (<div className={contactStatus} onClick={() => {this.toggleContact()}}>
                    <ul className={styles.detail}>
                        <li className={hideForEnStyle}>
                            <FormattedMessage
                                id="contact.consultant.qq"
                                defaultMessage="售前咨询qq群 12742516"/>
                        </li>
                        <li>
                            <FormattedMessage
                                id="contact.consultant.phone"
                                defaultMessage="售前咨询电话 400 632 6626"/>
                        </li>
                        <li className={styles.arrowRight}>
                            <a href={forumLink} target="_blank">
                                <FormattedMessage
                                    id="contact.forum.issue"
                                    defaultMessage="论坛 集成问题"/>
                            </a>
                        </li>
                        <li className={styles.arrowRight}>
                            <a href={worksheetLink} target="_blank">
                                <FormattedMessage
                                    id="contact.worksheet.issue"
                                    defaultMessage="工单 售后质量问题"/>
                            </a>
                        </li>
                    </ul>
                </div>);
    }
}