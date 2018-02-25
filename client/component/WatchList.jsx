
import Component from 'core/Component';
import PropTypes from 'prop-types';
import React from 'react';

import Card from 'component/Card';

export default class WatchList extends Component {
  static defaultProps = {
    title: 'Watch List',
  };

  static propTypes = {
    loading: PropTypes.bool,
    items: PropTypes.array,
    title: PropTypes.string
  };

  // const WatchList = (props) => (
  //   <div className={ `watch-list ${ props.className }` }>
  //     <p className="watch-list__title">
  //       { props.title }
  //     </p>
  //     {}
  //   </div>
  // );

  render() {
    const { props } = this;

    return (
      <Card title={ props.title } className="watch-list" >
        { props.items }
      </Card>
    );
  };
}
