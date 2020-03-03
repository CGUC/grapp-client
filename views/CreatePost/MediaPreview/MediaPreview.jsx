import React from 'react';
import { View, Image } from 'react-native';
import Poll from '../../../components/Poll/Poll';
import styles from './MediaPreviewStyle';

export default class MediaPreview extends React.Component {
  render() {
    if (this.props.image) {
      return (
        <View style={styles.view}>
          <Image source={{ uri: this.props.image }} style={styles.image} />
        </View>
      );
    }
    if (this.props.isPoll) {
      return (
        <View style={[styles.view, styles.pollView]}>
          <Poll
            data={this.props.poll}
            savePoll={this.props.updatePoll}
            loggedInUser={this.props.loggedInUser}
            isAuthor
          />
        </View>
      );
    }
    return null;
  }
}
