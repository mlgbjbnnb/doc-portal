import React from 'react';
import styles from '../style/theme.scss';
import 'whatwg-fetch';
import { FormattedMessage } from 'react-intl';
import { fetchFAQ } from '../actions/dpActions';

export default class DpFaqPush extends React.Component {
    constructor(props) {
        super(props);
        this.render = this.render.bind(this);
    }

    componentDidMount() {
        this.props.childDispatch(fetchFAQ(this.props.articleInfo.lang, this.props.faqTitle));
    }

    render() {
        const faqContentHtml = (<div className={styles.faqContent}>
            {
                this.props.faqResult[this.props.faqTitle].data && this.props.faqResult[this.props.faqTitle].data.list.map((data, index) => {
                    return (<a key={index} href={data.url} target="_blank" dangerouslySetInnerHTML={{ __html: data.title }}>
                    </a>)
                })
            }
        </div>);

        return (<div className={styles.faqBlock}>
            <div className={styles[`faqTitle-${this.props.articleInfo.lang}`]}>
                <FormattedMessage
                    id={this.props.faqTitle}
                    defaultMessage={this.props.faqTitle}/>
            </div>
            {faqContentHtml}
        </div>);
    }
}