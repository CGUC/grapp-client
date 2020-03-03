/* eslint-disable react/jsx-no-bind */
import React from 'react';
import Autolink from 'react-native-autolink';
import { View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { CheckBox, Icon } from 'react-native-elements';
import { Text, Textarea } from 'native-base';
import * as Font from 'expo-font';
import { pollVote, pollOption, pollDeleteOption } from '../../helpers/poll';
import styles from './PollStyle';

export default class Poll extends React.Component {
  constructor(props) {
    super(props);

    const cleanOpts =
      this.props.data && this.props.data.options ? this.props.data.options : [];
    const cleanMultiSelect = !(
      this.props.data && this.props.data.multiSelect === false
    );
    const cleanOpen = !!(this.props.data && this.props.data.open === true);

    this.state = {
      multiSelect: cleanMultiSelect,
      open: cleanOpen,
      options: cleanOpts,
      newOption: '',
      isAdmin:
        this.props.loggedInUser &&
        this.props.loggedInUser.role &&
        this.props.loggedInUser.role.includes('admin'),
    };
  }

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require('../../node_modules/native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('../../node_modules/native-base/Fonts/Roboto_medium.ttf'),
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.options && !nextState.options) {
      // eslint-disable-next-line no-param-reassign
      nextState.options = this.state.options;
    }
    return true;
  }

  getTotal = options => {
    let total = 0;
    options.forEach(opt => {
      total += opt.usersVoted.length;
    });
    return total;
  };

  newOptionUpdate = async text => {
    const match = /\r|\n/.exec(text);
    if (match) {
      this.addOption();
      return;
    }
    if (text.length >= 200) {
      return;
    }
    this.setState({ newOption: text });
  };

  toggleMultiSelect = async () => {
    if (this.state.multiSelect) {
      for (let i = 0; i < this.state.options.length; i++) {
        const allUsersVoted = this.state.options.reduce(
          (acc, option) => acc.concat(option.usersVoted),
          [],
        );
        const hasDuplicates =
          new Set(allUsersVoted).size !== allUsersVoted.length;
        if (hasDuplicates) {
          Alert.alert(
            'Sorry',
            'Single selection is not allowed because users have selected multiple options in this poll.',
            [{ text: 'OK' }],
            { cancelable: true },
          );
          return;
        }
      }
    }
    this.state.multiSelect = !this.state.multiSelect;
    this.props.savePoll({
      multiSelect: this.state.multiSelect,
      open: this.state.open,
      options: this.state.options,
    });
  };

  toggleOpen = () => {
    this.state.open = !this.state.open;
    this.props.savePoll({
      multiSelect: this.state.multiSelect,
      open: this.state.open,
      options: this.state.options,
    });
  };

  userVoteIndex = option =>
    option.usersVoted.findIndex(voter => voter === this.props.loggedInUser._id);

  serverVote = (option, retract) => {
    pollVote(this.props.postId, { retract, optionId: option._id })
      .then(poll => {
        if (!poll.options) {
          return;
        }
        this.setState({ options: poll.options });
        if (this.props.updatePoll)
          this.props.updatePoll({
            multiSelect: this.state.multiSelect,
            open: this.state.open,
            options: poll.options,
          });
      })
      .catch(() => alert('Error updating vote. Sorry about that!'));
  };

  updateOptionVoters = option => {
    const userIndex = this.userVoteIndex(option);
    if (!this.props.savePoll) {
      this.serverVote(option, userIndex >= 0);
    } else if (userIndex === -1) {
      option.usersVoted.push(this.props.loggedInUser._id);
    } else {
      option.usersVoted.splice(userIndex, 1);
    }
  };

  toggleOption = async item => {
    if (!this.state.options) {
      return;
    }
    const opts = this.state.options;
    const optIndex = opts.findIndex(opt => opt.key === item.key);
    if (optIndex === -1) {
      return;
    }
    if (this.state.multiSelect) {
      this.updateOptionVoters(opts[optIndex]);
    } else if (!this.props.savePoll) {
      const selectedIndex = opts.findIndex(opt => this.userVoteIndex(opt) >= 0);
      if (selectedIndex === optIndex) {
        this.serverVote(opts[optIndex], true);
      } else if (selectedIndex >= 0) {
        pollVote(this.props.postId, {
          retract: true,
          optionId: opts[selectedIndex]._id,
        })
          .then(() => {
            this.serverVote(opts[optIndex], false);
          })
          .catch(() => alert('Error updating vote. Sorry about that!'));
      } else {
        this.serverVote(opts[optIndex], false);
      }
    } else {
      for (let i = 0; i < opts.length; i++) {
        if (i === optIndex) {
          this.updateOptionVoters(opts[optIndex]);
        } else {
          const userIndex = this.userVoteIndex(opts[i]);
          if (userIndex >= 0) {
            opts[i].usersVoted.splice(userIndex, 1);
          }
        }
      }
    }
    if (this.props.savePoll)
      this.props.savePoll({
        multiSelect: this.state.multiSelect,
        open: this.state.open,
        options: opts,
      });
  };

  confirmDelete = async item => {
    if (
      !this.props.isAuthor &&
      !this.state.isAdmin &&
      item.creator !== this.props.loggedInUser._id
    ) {
      return;
    }
    Alert.alert(
      'Hold Up!',
      `Are you sure you want to remove this option?\nOption: ${item.text}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: this.deleteOption.bind(this, item) },
      ],
    );
  };

  deleteOption = item => {
    if (this.props.savePoll) {
      const opts = this.state.options;
      const optIndex = opts.findIndex(opt => opt.key === item.key);
      if (optIndex === -1) {
        return;
      }
      opts.splice(optIndex, 1);
      this.props.savePoll({
        multiSelect: this.state.multiSelect,
        open: this.state.open,
        options: opts,
      });
    } else {
      pollDeleteOption(this.props.postId, item)
        .then(poll => {
          if (!poll.options) {
            return;
          }
          this.setState({ options: poll.options });
          if (this.props.updatePoll)
            this.props.updatePoll({
              multiSelect: this.state.multiSelect,
              open: this.state.open,
              options: poll.options,
            });
        })
        .catch(() => alert('Error removing option. Sorry about that!'));
    }
  };

  addOption = async () => {
    if (this.state.newOption.length === 0) {
      return;
    }
    if (this.state.options.length >= 10) {
      alert('Cannot have more than 10 options on a poll. Sorry about that!');
      return;
    }
    const optionText = this.state.newOption;
    if (!this.props.savePoll) {
      pollOption(this.props.postId, { option: optionText })
        .then(poll => {
          if (!poll.options) {
            return;
          }
          this.setState({ options: poll.options, newOption: '' });
          if (this.props.updatePoll)
            this.props.updatePoll({
              multiSelect: this.state.multiSelect,
              open: this.state.open,
              options: poll.options,
            });
        })
        .catch(() => alert('Error adding poll option. Sorry about that!'));
    } else {
      const opts = this.state.options;
      opts.push({
        key: `${this.state.options.length}`,
        text: optionText,
        usersVoted: [],
      });
      this.props.savePoll({
        multiSelect: this.state.multiSelect,
        open: this.state.open,
        options: opts,
      });
      this.setState({ newOption: '' });
    }
  };

  buildListItems = () => {
    if (!this.state.options) {
      return null;
    }
    const items = this.state.options
      .sort((a, b) => b.usersVoted.length - a.usersVoted.length)
      .slice()
      .map(item => {
        if (item._id) {
          item.key = item._id; // eslint-disable-line no-param-reassign
        }
        return item;
      });
    if (!!this.props.isAuthor || this.state.open) {
      items.push({ key: 'add_option_item' });
    }
    return items;
  };

  renderListItem = ({ item }) => {
    if (item.key === 'add_option_item') {
      return (
        <View style={styles.optionGroup}>
          <TouchableOpacity
            style={styles.addContainingView}
            onPress={this.addOption}
          >
            <Icon name="add" style={styles.addView} />
          </TouchableOpacity>
          <Textarea
            placeholder="Add an option..."
            style={styles.addOptionText}
            onChangeText={this.newOptionUpdate}
            value={this.state.newOption}
          />
        </View>
      );
    }
    const selected = this.userVoteIndex(item) !== -1;
    const totalCount = this.getTotal(this.state.options);
    const percentage =
      totalCount === 0
        ? 0
        : ((item.usersVoted.length / totalCount) * 100).toFixed();
    const canDelete =
      this.props.isAuthor ||
      this.state.isAdmin ||
      item.creator === this.props.loggedInUser._id;
    return (
      <TouchableOpacity
        style={styles.fillWidth}
        onPress={this.toggleOption.bind(this, item)}
        onLongPress={this.confirmDelete.bind(this, item)}
      >
        <View style={styles.optionView}>
          {this.state.multiSelect ? (
            <CheckBox
              style={styles.optionButton}
              containerStyle={styles.optionButtonContainer}
              checked={selected}
              onIconPress={this.toggleOption.bind(this, item)}
              onLongIconPress={this.confirmDelete.bind(this, item)}
            />
          ) : (
            <CheckBox
              style={styles.optionButton}
              containerStyle={styles.optionButtonContainer}
              checkedIcon="dot-circle-o"
              uncheckedIcon="circle-o"
              checked={selected}
              onIconPress={this.toggleOption.bind(this, item)}
              onLongIconPress={this.confirmDelete.bind(this, item)}
            />
          )}
          <Autolink style={styles.optionText} text={item.text} />
          <Text style={styles.optionCount}>
            {`${item.usersVoted.length}: ${percentage}%`}
          </Text>
          {canDelete ? (
            <TouchableOpacity
              style={styles.optionDeleteContainer}
              onPress={this.confirmDelete.bind(this, item)}
            >
              <Icon name="delete" style={styles.optionDelete} />
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const editing = !!this.props.savePoll;

    return (
      <View style={styles.view}>
        <FlatList
          style={styles.fillWidth}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          data={this.buildListItems()}
          renderItem={this.renderListItem}
          extraData={this.state}
        />
        {!!this.props.isAuthor && editing ? (
          <View style={styles.fillWidth}>
            <CheckBox
              style={styles.topCheckbox}
              containerStyle={styles.topCheckboxContainer}
              title="Allow Option Creation"
              iconRight
              right
              checked={this.state.open}
              onPress={this.toggleOpen}
              onIconPress={this.toggleOpen}
            />
            <CheckBox
              style={styles.topCheckbox}
              containerStyle={styles.topCheckboxContainer}
              title="Allow Multiple Selection"
              iconRight
              right
              checked={this.state.multiSelect}
              onPress={this.toggleMultiSelect}
              onIconPress={this.toggleMultiSelect}
            />
          </View>
        ) : null}
      </View>
    );
  }
}
