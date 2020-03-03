import React from 'react';
import { Text, View, Image, TouchableOpacity, Platform } from 'react-native';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import styles from './ProfileHeaderStyle';
import { getProfilePicture, setProfilePicture } from '../../helpers/imageCache';

export default class ProfileHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profilePicture: null,
    };
  }

  componentDidMount() {
    getProfilePicture(this.props.user._id)
      .then(pic => {
        this.setState({
          profilePicture: pic,
        });
      })
      .catch(() => {
        this.props.navigation.navigate('Auth');
      });
  }

  pickImage = async () => {
    /**
     * iOS needs permission for CAMERA_ROLL to launch ImagePicker
     */
    if (Platform.OS === 'ios') {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.CAMERA_ROLL,
      );
      let finalStatus = existingStatus;

      // only ask if permissions have not already been determined, because
      // iOS won't necessarily prompt the user a second time.
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        finalStatus = status;
      }

      // Stop here if the user did not grant permissions
      if (finalStatus !== 'granted') {
        return null;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      base64: true,
      aspect: [1, 1],
      quality: 0.2,
    });

    if (!result.cancelled) {
      setProfilePicture(this.props.user._id, result.uri)
        .then(pic => {
          this.setState({
            profilePicture: pic,
          });
        })
        .catch(err => {
          console.error(err);
        });
    }

    return result;
  };

  static navigationOptions = { header: null };

  render() {
    return (
      <View style={styles.ProfileHeader}>
        <TouchableOpacity onPress={this.pickImage}>
          <Image
            style={styles.profilePicture}
            source={{
              uri: `data:image/png;base64,${this.state.profilePicture}`,
            }}
          />
        </TouchableOpacity>
        <Text style={styles.profileNameText}>
          {this.props.user.firstName} {this.props.user.lastName}
        </Text>
        <Text style={styles.profileNameText}>
          {`( ${this.props.user.username} )`}
        </Text>
      </View>
    );
  }
}
