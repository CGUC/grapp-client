import React from 'react';
import Autolink from 'react-native-autolink';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import Image from 'react-native-scalable-image';
import {
  Body,
  Card,
  CardItem,
  Text,
  Thumbnail,
  Button,
  Icon,
} from 'native-base';
import * as Font from 'expo-font';
import date from 'date-fns';
import Popover from 'react-native-popover-view';
import { getProfilePicture, getPostPicture } from '../../helpers/imageCache';
import { getPoll } from '../../helpers/poll';
import PollPreview from '../Poll/PollPreview/PollPreview';
import Poll from '../Poll/Poll';
import styles from './PostStyle';

export default class Post extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      profilePicture: null,
      showEditButtons: false,
      image: null,
      poll: null,
      pollCopy: null,
      updateKey: 0,
    };
  }

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require('../../node_modules/native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('../../node_modules/native-base/Fonts/Roboto_medium.ttf'),
    });

    getProfilePicture(this.props.data.author._id)
      .then(pic => {
        this.setState({
          profilePicture: pic,
        });
      })
      .catch(error => {
        console.error(error);
      });
    const { media } = this.props.data;
    if (media && media.type === 'image') {
      getPostPicture(this.props.data._id)
        .then(pic => {
          this.setState({
            image: pic,
          });
        })
        .catch(error => {
          console.error(error);
        });
    }
    if (media && media.type === 'poll') {
      getPoll(this.props.data._id)
        .then(poll => {
          this.setState({
            poll,
            pollCopy: this.copyPollData(poll),
          });
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  getMenuOptions() {
    if (this.props.enableEditing || this.props.enableDeleting) {
      return (
        <View style={styles.view}>
          {this.props.enableEditing && (
            <Button block style={styles.editButton} onPress={this.onPressEdit}>
              <Text>Edit Post</Text>
            </Button>
          )}
          <Button
            block
            style={styles.deleteButton}
            onPress={this.onPressDelete}
          >
            <Text>Delete Post</Text>
          </Button>
        </View>
      );
    }
    return (
      <View style={styles.view}>
        <Button
          block
          style={styles.deleteButton}
          onPress={this.onPressFlagInappropriate}
        >
          <Text>Flag as inappropriate</Text>
        </Button>
        <Button block style={styles.deleteButton} onPress={this.onPressBlock}>
          <Text>Report/block user</Text>
        </Button>
      </View>
    );
  }

  onPressOptions = () => {
    this.setState({ showEditButtons: true });
  };

  onPressEdit = () => {
    this.hideEditButtons();
    const { data, loggedInUser } = this.props;
    const { pollCopy, image } = this.state;
    this.props.navigation.navigate('CreatePost', {
      data,
      poll: pollCopy,
      image,
      loggedInUser,
    });
  };

  onPressDelete = () => {
    Alert.alert(
      'Hold Up!',
      'Removing this post will also delete all comments associated with it.\nAre you sure you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: this.onConfirmDelete },
      ],
    );
  };

  onConfirmDelete = () => {
    const { updatePost, data } = this.props;

    const postId = data._id;

    this.hideEditButtons();

    if (updatePost) updatePost(postId, {}, 'deletePost');
  };

  onPressPost = () => {
    // Call parent to navigate
    const { onPressPost, data } = this.props;
    if (onPressPost) onPressPost(data);
  };

  onPressFlagInappropriate = () => {
    Alert.alert(
      'Hold Up!',
      'Are you sure you want to flag this post as inappropriate?\nDoing so will notify the webmasters.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: this.notifyWebmasters },
      ],
    );
  };

  onPressBlock = () => {
    Alert.alert(
      'Hold Up!',
      'Are you sure you want to report this user?\nDoing so will notify the webmasters, who can block their account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: this.notifyWebmasters },
      ],
    );
  };

  copyPollData = source => {
    if (!source) {
      return null;
    }
    return JSON.parse(JSON.stringify(source));
  };

  updatePoll = async poll => {
    const { updatePost, data } = this.props;
    const postId = this.props.data._id;
    const updatedData = {
      ...data,
      content: poll.title,
      poll,
    };

    const { updateKey } = this.state;
    this.setState({
      updateKey: (updateKey + 1) % 10,
      poll,
      pollCopy: this.copyPollData(poll),
    });

    if (updatePost) updatePost(postId, updatedData, 'votePoll');
  };

  toggleLike = () => {
    const { updatePost, data, loggedInUser } = this.props;

    if (data.usersLiked.find(user => user._id === loggedInUser._id)) {
      data.likes--;
      data.usersLiked = data.usersLiked.filter(
        user => user._id !== loggedInUser._id,
      );
    } else {
      data.likes++;
      data.usersLiked.push({
        _id: loggedInUser._id,
        firstname: loggedInUser.firstName,
        lastName: loggedInUser.lastName,
      });
    }

    if (data.likes < 0) data.likes = 0; // (Grebel's a positive community, come on!)

    if (updatePost) updatePost(data._id, data, 'toggleLike');
  };

  generateLikesList = () => {
    let { usersLiked } = this.props.data;

    if (usersLiked.filter(e => e._id === this.props.loggedInUser._id).length) {
      usersLiked = usersLiked.filter(
        user => user._id !== this.props.loggedInUser._id,
      );
      usersLiked.unshift({ firstName: 'You' }); // a wee hack
    }

    return (
      <ScrollView contentContainerStyle={styles.likedList}>
        <Thumbnail
          small
          square
          source={require('../../assets/liked-cookie.png')}
          style={styles.likedListIcon}
        />
        <View style={styles.line} />
        {usersLiked.map(user => (
          <Text key={user._id} style={styles.likedListItem}>
            {user.firstName} {user.lastName || ''}
          </Text>
        ))}
      </ScrollView>
    );
  };

  notifyWebmasters = () => {
    Alert.alert(
      'Wemasters alerted',
      'The webmasters have been notified about your request.',
      [{ text: 'Continue', style: 'cancel' }],
    );
  };

  hideEditButtons = () => {
    this.setState({ showEditButtons: false });
  };

  render() {
    const { showEditButtons, showLikedList, poll } = this.state;

    const { data, showUserProfile, loggedInUser } = this.props;

    const { author, content, comments, tags } = data;
    let { usersLiked, createdAt } = data;
    const isLiked =
      usersLiked.filter(e => e._id === this.props.loggedInUser._id).length > 0;
    const likeIcon = isLiked
      ? require('../../assets/liked-cookie.png')
      : require('../../assets/cookie-icon.png');
    const isAuthor = author._id === loggedInUser._id;

    if (isLiked) {
      usersLiked = usersLiked.filter(
        user => user._id !== this.props.loggedInUser._id,
      );
      usersLiked.unshift({ firstName: 'You' });
    }
    let likesDialog;
    const likes = usersLiked.length;
    if (likes === 0) {
      likesDialog = 'No cookies yet';
    } else if (likes === 1) {
      likesDialog = `${usersLiked[0].firstName}`;
    } else if (likes === 2) {
      likesDialog = `${usersLiked[0].firstName} and ${usersLiked[1].firstName}`;
    } else {
      likesDialog = `${usersLiked[0].firstName},\n${
        usersLiked[1].firstName
      } and ${likes - 2} ${likes === 3 ? 'other' : 'others'}`;
    }

    // In case author account is deleted
    let authorName;
    if (!author) authorName = 'Ghost';
    else authorName = `${author.firstName} ${author.lastName}`;

    if (this.props.showFullDate) {
      // If in comment view, view full date including timestamp
      createdAt = date.format(createdAt, 'ddd MMM Do [at] h:mma');
    } else if (date.isPast(date.addWeeks(createdAt, 1))) {
      // If the post is more than a week old, display date
      createdAt = date.format(createdAt, 'ddd MMM Do');
    } else {
      // Display how long ago the post was made
      createdAt = date.distanceInWordsToNow(createdAt, { addSuffix: true });
    }

    const numComments = comments ? comments.length : 0;

    if (!tags || !tags[0]) {
      console.warn(`Post by ${author} does not have tags: ${content}`);
      return null;
    }

    return (
      <View>
        <KeyboardAvoidingView
          behavior="position"
          keyboardVerticalOffset={Platform.OS === 'android' ? 30 : 0}
          enabled={poll && this.props.onPressPost}
        >
          <Card style={styles.card}>
            <CardItem>
              {/* Using flexbox here because NativeBase's Left/Body/Right isn't as customizable */}
              <View style={styles.headerContainer}>
                <View style={styles.headerLeft}>
                  <View>
                    <TouchableOpacity onPress={() => showUserProfile(author)}>
                      <Thumbnail
                        style={styles.profilePicThumbnail}
                        source={{
                          uri: `data:image/png;base64,${this.state.profilePicture}`,
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.headerBody}>
                    <View style={styles.authorDetails}>
                      <Text>{authorName}</Text>
                      <Text>
                        {this.props.showTag ? ` ►  ${tags[0]}` : null}
                      </Text>
                    </View>
                    <Text note>{createdAt}</Text>
                  </View>
                </View>

                <View style={styles.headerRight}>
                  <TouchableOpacity
                    onPress={this.onPressOptions}
                    hitSlop={{
                      top: 20,
                      bottom: 20,
                      left: 20,
                      right: 20,
                    }}
                  >
                    <Icon
                      style={styles.icon}
                      type="MaterialIcons"
                      name="more-vert"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </CardItem>

            <CardItem
              button
              onPress={this.onPressPost}
              style={styles.postContent}
            >
              <Body>
                <Autolink
                  text={content}
                  numberOfLines={this.props.maxLines}
                  ellipsizeMode="tail"
                />
                {poll &&
                  (this.props.onPressPost ? (
                    <PollPreview data={poll} loggedInUser={loggedInUser} />
                  ) : (
                    <Poll
                      data={poll}
                      postId={data._id}
                      updatePoll={this.updatePoll}
                      loggedInUser={loggedInUser}
                      isAuthor={isAuthor}
                    />
                  ))}
              </Body>
            </CardItem>

            {this.state.image ? (
              <CardItem style={styles.imageContainer}>
                <TouchableWithoutFeedback onPress={this.onPressPost}>
                  <Image
                    style={styles.image}
                    width={Dimensions.get('window').width}
                    source={{
                      uri: `data:image/png;base64,${this.state.image}`,
                    }}
                  />
                </TouchableWithoutFeedback>
              </CardItem>
            ) : null}

            <CardItem style={styles.postFooter}>
              <View style={styles.footerContainer}>
                <View style={styles.iconContainer}>
                  <TouchableOpacity onPress={this.toggleLike}>
                    <Thumbnail
                      small
                      square
                      source={likeIcon}
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.setState({ showLikedList: true })}
                    ref={ref => {
                      this.dialogRef = ref;
                    }}
                    hitSlop={{
                      top: 10,
                      bottom: 10,
                      left: 0,
                      right: 40,
                    }}
                  >
                    <Text style={styles.likesDialog}>{`${likesDialog}`}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={this.onPressPost}>
                  <View style={styles.commentsContainer}>
                    <Thumbnail
                      small
                      square
                      source={require('../../assets/comments-icon.png')}
                      style={styles.icon}
                    />
                    <Text style={styles.commentsDialog}>
                      {`${numComments}`}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </CardItem>

            <Popover
              fromView={this.dialogRef}
              isVisible={showLikedList}
              onClose={() => this.setState({ showLikedList: false })}
            >
              {this.generateLikesList()}
            </Popover>
          </Card>
        </KeyboardAvoidingView>

        <View>
          <Modal
            animationType="slide"
            transparent
            visible={showEditButtons}
            onRequestClose={this.hideEditButtons}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.editButtonsContainer}
              onPress={this.hideEditButtons}
            >
              {this.getMenuOptions()}
            </TouchableOpacity>
          </Modal>
        </View>
      </View>
    );
  }
}
