import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import {
  Card,
  CardItem,
  Text,
  Thumbnail,
  Item,
  Input,
  Button,
} from 'native-base';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Switch from 'react-native-switch-pro';
import Autolink from 'react-native-autolink';
import * as Font from 'expo-font';
import date from 'date-fns';
import { getProfilePicture } from '../../helpers/imageCache';
import styles from './DonStatusCardStyle';

export default class DonStatusCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      profilePicture: null,
      isOn: props.don.donInfo.isOn,
      isLateSupper: props.don.donInfo.isOnLateSupper,
      isDateTimePickerVisible: false,
      clockOut: props.don.donInfo.clockOut,
      location: props.don.donInfo.location,
    };
  }

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require('../../node_modules/native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('../../node_modules/native-base/Fonts/Roboto_medium.ttf'),
    });
    getProfilePicture(this.props.don._id)
      .then(pic => {
        this.setState({
          profilePicture: pic,
        });
      })
      .catch(error => {
        console.error(error);
      });
  }

  getRightHeaderJSX() {
    if (this.props.isSuperintendent) {
      return null;
    }
    if (this.props.togglable) {
      const icon = this.state.isLateSupper
        ? require('../../assets/supper-on.png')
        : require('../../assets/supper-off.png');
      return (
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={this.handleToggleLateSupper}>
            <Thumbnail medium square source={icon} />
          </TouchableOpacity>
          <Switch value={this.state.isOn} onSyncPress={this.handleToggleOn} />
        </View>
      );
    }
    if (this.state.isOn) {
      const icon = this.state.isLateSupper
        ? require('../../assets/don-on-supper.png')
        : require('../../assets/don-on.png');
      return (
        <View style={styles.headerRight}>
          <Thumbnail medium square source={icon} />
        </View>
      );
    }
    return null;
  }

  showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

  hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

  handleDatePicked = datetime => {
    this.update({ isDateTimePickerVisible: false, clockOut: datetime });
  };

  handleUpdatedLocation = text => {
    this.update({ location: text });
  };

  handleToggleLateSupper = () => {
    if (this.props.togglable) {
      this.update({ isLateSupper: !this.state.isLateSupper });
    }
  };

  handleToggleOn = () => {
    if (this.props.togglable) {
      // Set default time if the current clock out time is invalid
      // default time is 8:30am on the next weekday
      let nextClockOut = this.state.clockOut;

      // check for valid time
      if (
        !date.isValid(new Date(this.state.clockOut)) ||
        date.isPast(this.state.clockOut)
      ) {
        // set the time to 8:30, then find the next weekday
        nextClockOut = date.setHours(date.setMinutes(new Date(), 30), 8);
        if (date.isFriday(nextClockOut)) {
          nextClockOut = date.addDays(nextClockOut, 3);
        } else if (date.isSaturday(nextClockOut)) {
          nextClockOut = date.addDays(nextClockOut, 2);
        } else {
          nextClockOut = date.addDays(nextClockOut, 1);
        }
      }
      this.update({ isOn: !this.state.isOn, clockOut: nextClockOut });
    }
  };

  update = newState => {
    this.setState(newState);

    if (this.props.togglable) {
      // update all the fields
      const { don } = this.props;
      don.donInfo.isOn = 'isOn' in newState ? newState.isOn : this.state.isOn;
      don.donInfo.isOnLateSupper =
        'isLateSupper' in newState
          ? newState.isLateSupper
          : this.state.isLateSupper;
      don.donInfo.clockOut =
        'clockOut' in newState ? newState.clockOut : this.state.clockOut;
      don.donInfo.location =
        'location' in newState ? newState.location : this.state.location;

      // notify DonInfo page that something changed
      const { onChange } = this.props;
      onChange();
    }
  };

  render() {
    const { don } = this.props;

    // Entering the land of way-too-many-if-statements. You have been warned.

    // In case don account is deleted
    let donName;
    if (!don) donName = 'Ghost Don';
    else donName = `${don.firstName} ${don.lastName}`;

    // Figure out what information should be displayed on the 2 lines of text beside the profile
    let line1 = '';
    let line2 = '';
    if (this.props.isSuperintendent) {
      line1 = don.info ? don.info.phone : '';
      line2 = 'Apartment Superintendent';
    } else if (this.props.editable) {
      if (this.state.isOn) {
        line1 = 'On until';
        if (
          !date.isValid(new Date(this.state.clockOut)) ||
          date.isPast(this.state.clockOut)
        ) {
          line2 = 'forever';
        } else if (date.isToday(this.state.clockOut)) {
          line2 = date.format(this.state.clockOut, 'h:mma');
        } else if (date.isTomorrow(this.state.clockOut)) {
          line2 = date.format(this.state.clockOut, '[Tomorrow at] h:mma');
        } else {
          line2 = date.format(this.state.clockOut, 'ddd MMM Do [at] h:mma');
        }
      }
    } else {
      line1 = don.info ? don.info.phone : '';
      line2 = this.state.isOn ? don.donInfo.location : '';
    }
    if (line1 === undefined) line1 = '';
    if (line2 === undefined) line2 = '';

    return (
      <View>
        <Card style={styles.card}>
          <CardItem>
            <View style={styles.headerContainer}>
              <View style={styles.headerLeft}>
                <View>
                  <TouchableOpacity
                    onPress={() => this.props.onOpenProfile(don)}
                  >
                    <Thumbnail
                      style={styles.profilePicThumbnail}
                      source={{
                        uri: `data:image/png;base64,${this.state.profilePicture}`,
                      }}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.headerBody}>
                  <View style={styles.donDetails}>
                    <Text>{donName}</Text>
                  </View>
                  <Autolink text={line1} />
                  <Text note>{line2}</Text>
                </View>
              </View>
              {this.getRightHeaderJSX()}
            </View>
          </CardItem>
          {this.props.editable ? (
            <CardItem>
              <View style={styles.formElement}>
                <Text style={styles.fieldHeader}>Location</Text>
                <Item regular style={styles.inputItem}>
                  <Input
                    placeholder="Enter your location"
                    value={this.state.location}
                    onChangeText={this.handleUpdatedLocation}
                  />
                </Item>
                <Button onPress={this.showDateTimePicker} style={styles.button}>
                  <Text>Change Clockout Time</Text>
                </Button>
                <DateTimePicker
                  isVisible={this.state.isDateTimePickerVisible}
                  date={new Date(this.state.clockOut)}
                  onConfirm={this.handleDatePicked}
                  onCancel={this.hideDateTimePicker}
                  mode="datetime"
                  minimumDate={date.addMinutes(new Date(), 5)}
                />
              </View>
            </CardItem>
          ) : null}
        </Card>
      </View>
    );
  }
}
