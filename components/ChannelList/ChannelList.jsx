import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Container, Text, Content } from 'native-base';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';
import ApiClient from '../../ApiClient';

import styles from './ChannelListStyle';

const DEFAULT_CHANNELS = [
  { name: 'All Feed', id: 'all' },
  { name: 'My Posts', id: 'myPosts' },
  { name: 'My Subscriptions', id: 'subs' },
];

export default class ChannelList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      subscribedChannels: props.user.subscribedChannels,
      user: props.user,
    };
  }

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require('../../node_modules/native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('../../node_modules/native-base/Fonts/Roboto_medium.ttf'),
    });
    this.setState({ loading: false });
  }

  onPressChannel = (id, name) => {
    if (this.props.onPressChannel) this.props.onPressChannel(id, name);
  };

  getChannelCardJSX(channels) {
    const subs = this.state.subscribedChannels;
    const sortedChannels = channels.sort((c1, c2) => {
      if (c1.id === 'all') return -1;
      if (c2.id === 'all') return 1;
      if (c1.id === 'myPosts') return -1;
      if (c2.id === 'myPosts') return 1;
      if (c1.id === 'subs') return -1;
      if (c2.id === 'subs') return 1;

      if (subs.includes(c1.id) && !subs.includes(c2.id)) return -1;
      if (!subs.includes(c1.id) && subs.includes(c2.id)) return 1;

      if (c1.name < c2.name) return -1;
      return 1;
    });

    return _.map(sortedChannels, (channel, key) => {
      let icon = require('../../assets/bell-OFF.png');
      let opacity = 1;
      const subIndex = subs.indexOf(channel.id);
      if (channel.id === 'subs') {
        icon = require('../../assets/my-subs-bell-Icon.png');
      } else if (['all', 'myPosts'].includes(channel.id)) {
        // TODO: Give myPosts an icon
        opacity = 0;
      } else if (subIndex !== -1) {
        icon = require('../../assets/bell-ON.png');
      }

      return (
        <View style={styles.channelCard} key={`channel${key}`}>
          <TouchableOpacity
            onPress={this.updateSubscription(channel.id, subIndex)}
            activeOpacity={0.5}
          >
            <Image
              opacity={opacity}
              source={icon}
              style={styles.notificationBell}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.channelListButton}
            onPress={() => this.onPressChannel(channel.id, channel.name)}
          >
            <Text style={styles.channelText}>{channel.name}</Text>
            <Image
              source={require('../../assets/arrowright.png')}
              style={styles.rightArrow}
            />
          </TouchableOpacity>
        </View>
      );
    });
  }

  updateUserRequest = () => {
    const { user } = this.state;
    user.subscribedChannels = this.state.subscribedChannels;
    ApiClient.put(`/users/${user._id}`, user, { authorized: true }).catch(err =>
      console.error(err),
    );
  };

  updateSubscription = (id, index) => {
    if (['all', 'subs', 'myPosts'].includes(id)) return null;

    return () => {
      const subs = this.state.subscribedChannels;
      if (index === -1) {
        this.setState(
          {
            subscribedChannels: [...subs, id],
          },
          this.updateUserRequest,
        );
      } else {
        subs.splice(index, 1);
        this.setState(
          {
            subscribedChannels: subs,
          },
          this.updateUserRequest,
        );
      }
    };
  };

  render() {
    const { channels } = this.props;

    let channelList = _.map(channels, channel => ({
      name: channel.name,
      id: channel._id,
    }));

    channelList = DEFAULT_CHANNELS.concat(channelList);

    const channelCards = this.getChannelCardJSX(channelList);

    if (this.state.loading) {
      return (
        <Container>
          <AppLoading />
        </Container>
      );
    }
    return <Content>{channelCards}</Content>;
  }
}

ChannelList.defaultProps = {
  onPressChannel: () => {},
  channels: [],
};

ChannelList.propTypes = {
  onPressChannel: PropTypes.func,
  channels: PropTypes.array,
};
