import React from 'react';
import { View } from 'react-native';
import HomeTabBarButton from './HomeTabBarButton/HomeTabBarButton';

export default class HomeView extends React.Component {
  static navigationOptions = { header: null };

  render() {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#FFF' }}>
        <HomeTabBarButton
          text="Channels"
          image={require('../../../assets/channel-list.png')}
          selected={this.props.currentTab === 'channels'}
          onPress={() => {
            this.props.onSwitchTab('channels');
          }}
        />
        <HomeTabBarButton
          text="Notifications"
          image={
            this.props.newNotifications
              ? require('../../../assets/notification-list-with-badge.png')
              : require('../../../assets/notification-list.png')
          }
          selected={this.props.currentTab === 'notifs'}
          onPress={() => {
            this.props.onSwitchTab('notifs');
          }}
        />
      </View>
    );
  }
}
