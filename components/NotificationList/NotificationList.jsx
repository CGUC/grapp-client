import React from 'react';
import { TouchableOpacity, FlatList } from 'react-native';
import { Container, Text, Button } from 'native-base';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';
import date from 'date-fns';
import defaultStyles from '../../styles/styles';

import styles from './NotificationListStyle';

export default class NotificationList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require('../../node_modules/native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('../../node_modules/native-base/Fonts/Roboto_medium.ttf'),
    });
    this.setState({ loading: false });
  }

  renderListItem = ({ item }) => {
    let createdAt;
    if (date.isPast(date.addWeeks(item.createdAt, 1))) {
      // If the post is more than a week old, display date
      createdAt = date.format(item.createdAt, 'ddd MMM Do');
    } else {
      // Display how long ago the post was made
      createdAt = date.distanceInWordsToNow(item.createdAt, {
        addSuffix: true,
      });
    }
    return (
      <TouchableOpacity
        style={
          item.seen
            ? styles.notificationCardSeen
            : styles.notificationCardUnseen
        }
        onPress={() => {
          this.props.onPressNotif(item);
        }}
      >
        <Text
          numberOfLines={1}
          style={
            item.seen
              ? styles.notificationTitleSeen
              : styles.notificationTitleUnseen
          }
        >
          {item.title}
        </Text>
        <Text
          numberOfLines={2}
          style={
            item.seen
              ? styles.notificationBodySeen
              : styles.notificationBodyUnseen
          }
        >
          {item.body}
        </Text>
        <Text note>{createdAt}</Text>
      </TouchableOpacity>
    );
  };

  buildListItems() {
    // add key for FlatList
    return this.props.notifications
      .filter(notif => notif.data.post)
      .map(notif => ({
        ...notif,
        key: notif._id,
      }));
  }

  render() {
    if (this.state.loading) {
      return (
        <Container>
          <AppLoading />
        </Container>
      );
    }
    return (
      <Container style={defaultStyles.backgroundTheme}>
        {this.props.hasNewNotifications ? (
          <Button
            style={styles.markNotifsSeenButton}
            onPress={this.props.markNotifsSeen}
          >
            <Text>Mark All as Read</Text>
          </Button>
        ) : null}
        <FlatList
          data={this.buildListItems()}
          renderItem={this.renderListItem}
          refreshing={false}
          onRefresh={this.props.refreshNotifications}
        />
      </Container>
    );
  }
}
