
import Actions from '../../core/Actions';
import Component from '../../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';

import CardTXs from '../../component/Card/CardTXs';
import HorizontalRule from '../../component/HorizontalRule';
import Pagination from '../../component/Pagination';
import Select from '../../component/Select';
import CardAddressTXs from '../../component/Card/CardAddressTXs';

import { PAGINATION_PAGE_SIZE } from '../../constants';

const ReactMarkdown = require('react-markdown')

import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Divider, Box, Link, Paper } from '@material-ui/core';
import RedditIcon from '@material-ui/icons/Reddit'

//@todo rename to AddressMovements
class SocialFeed extends Component {
  static propTypes = {
    getSocial: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: true,
      pages: 0,
      page: 1,
      size: 10,
      social: [],
      total: 0,
      filter: localStorage.getItem('socialFilter') || null
    };

  };

  componentDidMount() {
    this.getSocial();
  };

  getSocial = () => {
    this.props.getSocial({
      //addressId: this.props.addressId,
      limit: this.state.size,
      skip: (this.state.page - 1) * this.state.size,
      ...(this.state.filter ? { filter: this.state.filter } : null)
    })
      .then(({ pages, social, total }) => {
        this.setState({ pages, social, total, loading: false }, () => {
          // this.props.setTXs(movements); // Add this set of new txs to store
        });
      })
      .catch(error => this.setState({ error, loading: false }));
  };

  handlePage = page => this.setState({ page }, this.getSocial);

  handleSize = size => this.setState({ size, page: 1 }, this.getSocial);


  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    } else if (this.state.loading) {
      return this.renderLoading();
    }
    const selectOptions = PAGINATION_PAGE_SIZE;

    const paginationSelect = (
      <label>
        Per Page
        <Select
          onChange={value => this.handleSize(value)}
          selectedValue={this.state.size}
          options={selectOptions} />
      </label>
    );
    const getFilterSelect = () => {
      const addressFilters = [
        { value: 'reddit', label: 'Reddit' },
      ];
      const handleAddressFilter = filter => {
        this.setState({ filter, page: 1 }, this.getSocial);
        localStorage.setItem('socialFilter', filter);
      };

      return (
        <label>
          Source Filter
        <Select
            onChange={value => handleAddressFilter(value)}
            selectedValue={this.state.filter}
            options={addressFilters} />
        </label>)
    };

    const getSocialList = (social) => {
      console.log(social);

      const getSocialItems = () => {
        const socialItems = [];

        const getTitle = (item) => {
          return <Link href={item.url} target="_blank" rel="noreferrer">{item.title}</Link>
        }

        const getDescription = (item) => {
          return (
            <React.Fragment>
              <Typography
                variant="body2"
              >
                {moment.unix(item.intervalNumber).format("MM/DD/YYYY")} - {moment.unix(item.intervalNumber).fromNow()}
              </Typography>
              <Typography color="textPrimary" variant="body2">
                <Box mt={1}>
                  <ReactMarkdown source={item.description} linkTarget="_blank" />
                </Box>
              </Typography>
            </React.Fragment>)
        }

        social.forEach((item, index) => {
          socialItems.push(<Box key={item._id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar>
                  <Link href={item.url} target="_blank" rel="noreferrer"><RedditIcon /></Link>
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={getTitle(item)} secondary={getDescription(item)} />
            </ListItem>
            {index !== social.length - 1 && <Divider />}
          </Box>);
        });


        return socialItems;
      }

      return <List>
        {getSocialItems()}
      </List>
    }

    return (
      <div>
        <HorizontalRule
          selects={[getFilterSelect(), paginationSelect]}
          title={`${this.props.title} (${this.state.total})`} />
        <Paper>
          <Box p={2}>
            {getSocialList(this.state.social)}
          </Box>
        </Paper>
        <Box mt={3}>
          <Pagination
            current={this.state.page}
            className="float-right"
            onPage={this.handlePage}
            total={this.state.pages} />
          <div className="clearfix" />
        </Box>
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getSocial: query => Actions.getSocial(query),
  //setTXs: txs => Actions.setTXs(dispatch, txs)
});

const mapState = state => ({
});

export default connect(mapState, mapDispatch)(SocialFeed);
