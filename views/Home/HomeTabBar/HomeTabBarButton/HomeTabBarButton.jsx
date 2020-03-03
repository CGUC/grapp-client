import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import styles from './HomeTabBarButtonStyle';

export default class HomeView extends React.Component {
  render() {
    return (
      <TouchableOpacity
        style={
          this.props.selected ? styles.buttonSelected : styles.buttonUnselected
        }
        activeOpacity={this.props.selected ? 1.0 : 0.5}
        onPress={this.props.onPress}
      >
        <View>
          <Image source={this.props.image} style={styles.image} />
        </View>
      </TouchableOpacity>
    );
  }
}
