import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import styles from './ToolbarStyle';

export default class Toolbar extends React.Component {
  takeImage = () => {
    const { takeImage } = this.props;
    takeImage();
  };

  pickImage = () => {
    const { pickImage } = this.props;
    pickImage();
  };

  addPoll = () => {
    const { addPoll } = this.props;
    addPoll();
  };

  clearMedia = () => {
    const { clearMedia } = this.props;
    clearMedia();
  };

  render() {
    const iconSize = 33;

    if (this.props.mediaSelected === false) {
      return (
        <View style={styles.view}>
          <TouchableOpacity onPress={this.clearMedia}>
            <MaterialIcon name="clear" size={iconSize} style={styles.icon} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.view}>
        <TouchableOpacity onPress={this.takeImage}>
          <MaterialIcon name="camera-alt" size={iconSize} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.pickImage}>
          <MaterialIcon name="image" size={iconSize} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.addPoll}>
          <MaterialIcon name="poll" size={iconSize} style={styles.icon} />
        </TouchableOpacity>
      </View>
    );
  }
}
