import React from 'react';
import styles from '../style/backToOld.scss';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import {switchOldVersionPopup} from '../actions/dpActions';

export default class DpBackToOld extends React.Component {
    constructor(props) {
        super(props);
        this.render = this.render.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.oldVersionLink = `https://docs.agora.io/${this.props.articleInfo.lang}/`;
    }

    handleClick() {
        let isPopupDisabled = localStorage.getItem('disable-popup');
        if(!isPopupDisabled) {
            this.props.childDispatch(switchOldVersionPopup(true));
        } else {
            location.href = this.oldVersionLink;
        }
    }

    render() {
        const versionBox = classNames({
            [styles.oldVersionBoxCn]: (this.props.articleInfo.lang === 'cn'),
            [styles.oldVersionBoxEn]: (this.props.articleInfo.lang === 'en')
        });
        return (
            <div className={styles.oldVersion}>
                <div className={versionBox}>
                    <div className={styles.oldVersionInfo}>
                        <FormattedMessage
                            id="switch.versioninfo"
                            defaultMessage="如果您想使用旧版本的开发者中心，可由此切换到旧版本来查看文档"/>
                    </div>
                    <div className={styles.oldVersionBtn} onClick={this.handleClick}>
                        <FormattedMessage
                            id="switch.oldversion"
                            defaultMessage="oldversion"/>
                    </div>
                </div>
            </div>
        );
    }
}