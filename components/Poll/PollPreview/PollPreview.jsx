import React from 'react';
import Autolink from 'react-native-autolink';
import { View, FlatList } from 'react-native';
import { Text } from 'native-base';
import * as Font from 'expo-font';
import styles from './PollPreviewStyle';

export default class PollPreview extends React.Component {
  constructor(props) {
    super(props);
    const cleanOpts =
      this.props.data && this.props.data.options ? this.props.data.options : [];

    this.state = {
      options: cleanOpts,
    };
  }

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require('../../../node_modules/native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('../../../node_modules/native-base/Fonts/Roboto_medium.ttf'),
    });
  }

  getTotal = options => {
    let total = 0;
    options.forEach(opt => {
      total += opt.usersVoted.length;
    });
    return total;
  };

  buildListItems = () => {
    const items = this.state.options
      .sort((a, b) => b.usersVoted.length - a.usersVoted.length)
      .slice(0, 3)
      .map(item => ({
        ...item,
        key: item._id,
      }));
    return items;
  };

  renderListItem = ({ item }) => {
    const userIndex = item.usersVoted.findIndex(
      voter => voter === this.props.loggedInUser._id,
    );
    let countText;
    if (userIndex >= 0) {
      if (item.usersVoted.length > 1) {
        countText = `You + ${item.usersVoted.length - 1}`;
      } else {
        countText = 'You';
      }
    } else {
      countText = `${item.usersVoted.length}`;
    }
    const totalCount = this.getTotal(this.state.options);

    return (
      <View style={styles.optionView}>
        <View style={styles.optionInfo}>
          <Autolink style={styles.optionText} text={item.text} />
          <Text style={styles.optionCount}>{countText}</Text>
        </View>
        <View style={styles.progressbar}>
          <View
            style={[
              styles.filler,
              {
                width: `${
                  totalCount === 0
                    ? 0
                    : (item.usersVoted.length / totalCount) * 100
                }%`,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  render() {
    let moreContent;
    const moreCount = this.state.options.length - 3;
    if (moreCount > 0) {
      moreContent = (
        <Text style={styles.moreContentText}>
          {`${moreCount} more option${moreCount > 1 ? 's' : ''}...`}
        </Text>
      );
    } else {
      moreContent = null;
    }

    return (
      <View style={styles.card}>
        <FlatList
          data={this.buildListItems()}
          renderItem={this.renderListItem}
          extraData={this.state}
        />
        {moreContent}
      </View>
    );
  }
}
