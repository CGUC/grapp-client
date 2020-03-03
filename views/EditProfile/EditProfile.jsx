import React from 'react';
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
} from 'react-native';
import { Icon, Item, Text, Input, Textarea } from 'native-base';
import GestureRecognizer from 'react-native-swipe-gestures';
import _ from 'lodash';
import ApiClient from '../../ApiClient';
import styles from './EditProfileStyle';
import defaultStyles from '../../styles/styles';
import ProfileHeader from '../../components/ProfileHeader/ProfileHeader';
import Spinner from '../../components/Spinner/Spinner';

export default class EditProfile extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: 'My Profile',
    headerTitle: null,
    get headerRight() {
      const state = navigation.getParam('saveState');
      if (!state || state === 'disabled') return null;
      if (state === 'hasChanges') {
        return (
          <TouchableOpacity onPress={navigation.getParam('save')}>
            <Icon type="MaterialIcons" name="save" style={styles.icon} />
          </TouchableOpacity>
        );
      }
      if (state === 'saving') {
        return (
          <View style={{ marginRight: 20 }}>
            <Spinner size="small" color="white" />
          </View>
        );
      }
      if (state === 'saved') {
        return <Icon type="MaterialIcons" name="check" style={styles.icon} />;
      }
      return null;
    },
  });

  constructor(props) {
    super(props);

    const user = props.navigation.getParam('user');

    this.state = {
      user,
      name: `${user.firstName} ${user.lastName}`,
      program: _.get(user, 'info.program', undefined),
      address: _.get(user, 'info.address', undefined),
      affiliation: _.get(user, 'info.affiliation', undefined),
      phone: _.get(user, 'info.phone', undefined),
      bio: _.get(user, 'info.bio', undefined),
      avoidKeyboard: false,
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({
      save: this.onSave,
      saveState: 'disabled',
    });
  }

  onSave = async () => {
    const { user } = this.state;
    const userData = this.compressData();

    this.props.navigation.setParams({ saveState: 'saving' });

    try {
      await ApiClient.put(`/users/${user._id}`, userData, { authorized: true });

      this.props.navigation.setParams({ saveState: 'saved' });
    } catch (err) {
      alert('Error updating profile. Sorry about that!');
      console.error(err);
    }
  };

  // Compresses data from state into single user object of original shape
  compressData() {
    const {
      user,
      name,
      program,
      address,
      affiliation,
      phone,
      bio,
    } = this.state;

    if (!user.info) user.info = {};

    if (name) {
      const [first, last] = name.split(' ');
      if (first) user.firstName = first;
      if (last) user.lastName = last;
    }

    if (program) user.info.program = program;
    if (address) user.info.address = address;
    if (affiliation) user.info.affiliation = affiliation;
    if (phone) user.info.phone = phone;
    if (bio) user.info.bio = bio;

    return user;
  }

  handleFocus(key) {
    if (['affiliation', 'bio'].includes(key)) {
      this.setState({
        avoidKeyboard: true,
      });
    }
  }

  updateFormStateFunc(key) {
    return value => {
      this.props.navigation.setParams({ saveState: 'hasChanges' });
      this.setState({
        [key]: value,
      });
    };
  }

  generateFieldJSX(key, title, placeholder) {
    return (
      <View style={styles.formElement}>
        <Text style={styles.fieldHeader}>{title}</Text>
        {key === 'bio' ? (
          <Textarea
            bordered
            style={styles.bioInput}
            placeholder={placeholder}
            value={this.state[key]}
            onChangeText={this.updateFormStateFunc(key)}
            onFocus={() => this.handleFocus(key)}
            onBlur={() => this.setState({ avoidKeyboard: false })}
          />
        ) : (
          <Item regular style={styles.inputItem}>
            <Input
              placeholder={placeholder}
              value={this.state[key]}
              onChangeText={this.updateFormStateFunc(key)}
              onFocus={() => this.handleFocus(key)}
              onBlur={() => this.setState({ avoidKeyboard: false })}
            />
          </Item>
        )}
      </View>
    );
  }

  render() {
    return (
      <ScrollView>
        <KeyboardAvoidingView
          behavior="position"
          enabled={this.state.avoidKeyboard}
          style={{ ...defaultStyles.backgroundTheme, ...styles.container }}
        >
          <ProfileHeader user={this.props.navigation.getParam('user')} />
          <GestureRecognizer
            onSwipeDown={() => Keyboard.dismiss()}
            style={styles.gestureRecognizer}
          >
            {this.generateFieldJSX('name', 'Name', 'Enter your name')}
            {this.generateFieldJSX(
              'program',
              'Program',
              'What are you studying?',
            )}
            {this.generateFieldJSX(
              'address',
              'Room Number / Address',
              'Where can you be found?',
            )}
            {this.generateFieldJSX(
              'affiliation',
              'Affiliation with Grebel',
              'i.e. Resident',
            )}
            {this.generateFieldJSX(
              'phone',
              'Phone Number',
              'Let others contact you',
            )}
            {this.generateFieldJSX(
              'bio',
              'Bio',
              'Share something about yourself',
            )}
          </GestureRecognizer>
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }
}
