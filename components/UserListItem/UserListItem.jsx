import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ListItem, Thumbnail, Text } from 'native-base';

import _ from 'lodash';

import styles from './UserListItemStyle';
import { getProfilePicture } from '../../helpers/imageCache';

export default class UserListItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      profilePicture: null,
    };
  }

  async componentWillMount() {
    getProfilePicture(this.props.user._id).then(response => {
      this.setState({
        profilePicture: response,
      });
    });
  }

  /**
   * Update profile picture if the user has changed
   */
  componentWillReceiveProps(nextProps) {
    if (nextProps.user && !_.isEqual(this.props.user, nextProps.user)) {
      getProfilePicture(nextProps.user._id).then(response => {
        this.setState({
          profilePicture: response,
        });
      });
    }
  }

  /**
   * Limit re-rendering for optimisation
   */
  shouldComponentUpdate(nextProps, nextState) {
    const { profilePicture } = this.state;
    const currentProps = this.props;

    if (!_.isEqual(currentProps.user, nextProps.user)) return true;
    if (!_.isEqual(profilePicture, nextState.profilePicture)) return true;
    return false;
  }

  render() {
    const { user, showUserProfile } = this.props;
    const { profilePicture } = this.state;
    if (!user) {
      return null;
    }
    return (
      <ListItem>
        <TouchableOpacity
          hitSlop={{
            top: 10,
            right: 300,
            bottom: 10,
            left: 0,
          }}
          onPress={() => showUserProfile(user)}
        >
          <View style={styles.rowContainer}>
            <View>
              <Thumbnail
                style={styles.profilePicThumbnail}
                source={{ uri: `data:image/png;base64,${profilePicture}` }}
              />
            </View>
            <Text style={styles.userName}>
              {`${user.firstName} ${user.lastName}`}
            </Text>
          </View>
        </TouchableOpacity>
      </ListItem>
    );
  }
}
