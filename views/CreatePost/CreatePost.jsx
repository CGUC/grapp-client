import React from 'react';
import { View, TouchableOpacity, Platform, Image } from 'react-native';
import { Text, Textarea, Container } from 'native-base';
import { ImagePicker, Permissions, Font } from 'expo';
import RNPickerSelect from 'react-native-picker-select';
import _ from 'lodash';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toolbar from './Toolbar/Toolbar';
import MediaPreview from './MediaPreview/MediaPreview';
import styles from './CreatePostStyle';
import ApiClient from '../../ApiClient';
import { setPostPicture, deletePostPicture } from '../../helpers/imageCache';
import { createPoll, removePoll } from '../../helpers/poll';
import Spinner from '../../components/Spinner/Spinner';

export default class CreatePost extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('data') ? 'Edit Post' : 'Make a Post',
    headerTitle: null,
    get headerRight() {
      const state = navigation.getParam('state');
      const isEditting = !!navigation.getParam('data');
      if (state === 'posting') {
        return (
          <View style={{ marginRight: 20 }}>
            <Spinner size="small" color="white" />
          </View>
        );
      }
      if (isEditting) {
        return (
          <TouchableOpacity onPress={navigation.getParam('saveResource')}>
            <Text style={styles.headerText}>Save</Text>
          </TouchableOpacity>
        );
      }
      return (
        <TouchableOpacity onPress={navigation.getParam('saveResource')}>
          <Text style={styles.headerText}>Post</Text>
        </TouchableOpacity>
      );
    },
  });

  constructor(props) {
    super(props);

    const channel = props.navigation.getParam('channel');
    const data = props.navigation.getParam('data');
    const image = props.navigation.getParam('image');
    const poll = props.navigation.getParam('poll');

    const existingText = data ? data.content : '';
    const selectedChannel = channel ? channel._id : '';

    this.state = {
      resourceText: existingText || '',
      image: image ? `data:image/png;base64,${image}` : null,
      imageUpdated: false,
      isPoll: !!poll,
      pollData: poll,
      pollUpdated: false,
      selectedChannel,
      channels: null,
    };
  }

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require('../../node_modules/native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('../../node_modules/native-base/Fonts/Roboto_medium.ttf'),
    });

    ApiClient.get('/channels', { authorized: true })
      .then(response => {
        const { navigation } = this.props;

        const channelList = _.map(response, channel => ({
          label: channel.name,
          tags: channel.tags,
          value: channel._id,
        }));

        let newState = { channels: channelList };

        // if editting a post, display the correct channel
        const data = navigation.getParam('data');
        if (data && data.tags) {
          let selectedChannel = channelList.filter(
            channel => channel.label === data.tags[0],
          )[0];
          selectedChannel = selectedChannel ? selectedChannel.value : null;
          newState = { ...newState, selectedChannel };
        }
        this.setState(newState);
      })
      .catch(err => console.error(err));
  }

  async componentDidMount() {
    const { navigation } = this.props;
    navigation.setParams({
      saveResource: this.saveResource,
      state: 'editting',
    });
  }

  saveResource = () => {
    const { navigation } = this.props;
    navigation.setParams({ state: 'posting' });

    const { resourceText, image, pollData, isPoll } = this.state;
    const data = navigation.getParam('data');

    // if updating post
    if (data) {
      this.updatePost({
        ...data,
        content: resourceText,
        image,
        poll: isPoll ? pollData : null,
      });
    } else {
      this.addPost({
        content: resourceText,
        image,
        poll: isPoll ? pollData : null,
      });
    }
  };

  addPost = data => {
    const { navigation } = this.props;

    const { selectedChannel, channels } = this.state;

    const loggedInUser = navigation.getParam('loggedInUser');

    const [channel] = channels.filter(
      rawChannel => rawChannel.value === selectedChannel,
    );
    if (!channel) {
      navigation.setParams({ state: 'editting' });
      alert('Please select a channel.');
      return;
    }

    const tags = channel.tags[0];

    const postContent = {
      author: loggedInUser._id,
      content: data.content,
      tags,
    };

    ApiClient.post('/posts', postContent, { authorized: true })
      .then(response => response.json())
      .then(post => {
        if (data.poll) {
          createPoll(post._id, data.poll)
            .then(() => {
              if (data.image) {
                setPostPicture(post._id, data.image).then(() =>
                  navigation.goBack(),
                );
              } else {
                navigation.goBack();
              }
            })
            .catch(err => {
              console.error(err);
              navigation.setParams({ state: 'editting' });
              alert('Error creating poll. Sorry about that!');
            });
        } else if (data.image) {
          setPostPicture(post._id, data.image).then(() => navigation.goBack());
        } else {
          navigation.goBack();
        }
      });
  };

  updatePost = async data => {
    const postId = data._id;
    const { navigation } = this.props;
    const {
      pollUpdated,
      isPoll,
      pollData,
      imageUpdated,
      image,
      channels,
      selectedChannel,
    } = this.state;

    const payload = { ...data };
    const channel = channels.filter(
      rawChannel => rawChannel.value === selectedChannel,
    );
    if (channel[0]) {
      payload.tags = [channel[0].label];
    } else {
      navigation.setParams({ state: 'editting' });
      alert('Please select a channel.');
      return;
    }

    ApiClient.put(`/posts/${postId}`, _.pick(payload, ['content', 'tags']), {
      authorized: true,
    })
      .then(() => {
        if (pollUpdated) {
          if (!isPoll) {
            removePoll(postId).then(() => {
              navigation.goBack();
            });
          } else {
            createPoll(postId, pollData).then(() => {
              navigation.goBack();
            });
          }
        }
        if (imageUpdated) {
          if (!image) {
            deletePostPicture(postId).then(() => {
              navigation.goBack();
            });
          } else {
            setPostPicture(postId, image).then(() => {
              navigation.goBack();
            });
          }
        } else {
          // no media updated, so just go back
          navigation.goBack();
        }
      })
      .catch(err => {
        console.error(err);
        alert('Error updating post. Sorry about that!');
      });
  };

  textUpdate = text => {
    this.setState({ resourceText: text });
  };

  takeImage = async () => {
    const { status: cameraPerm } = await Permissions.getAsync(
      Permissions.CAMERA,
    );
    let cameraStatus = cameraPerm;

    if (cameraPerm !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      cameraStatus = status;
    }

    const { status: cameraRollPerm } = await Permissions.getAsync(
      Permissions.CAMERA_ROLL,
    );
    let cameraRollStatus = cameraRollPerm;

    if (cameraRollPerm !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      cameraRollStatus = status;
    }

    if (cameraRollStatus !== 'granted' || cameraStatus !== 'granted') {
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      base64: true,
      quality: 0.5,
    });
    this.setState({
      image: result.uri,
      imageUpdated: true,
    });

    return result;
  };

  pickImage = async () => {
    if (Platform.OS === 'ios') {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.CAMERA_ROLL,
      );
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return null;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      base64: true,
      quality: 0.5,
    });
    this.setState({
      image: result.uri,
      imageUpdated: true,
    });

    return result;
  };

  addPoll = async () => {
    this.setState({
      isPoll: true,
      image: null,
      pollUpdated: true,
    });
  };

  clearMedia = async () => {
    const { image, isPoll } = this.state;

    this.setState({
      isPoll: false,
      image: null,
      imageUpdated: !!image,
      pollUpdated: isPoll,
    });
  };

  updatePoll = async data => {
    this.setState({
      isPoll: !!data,
      pollData: data,
      pollUpdated: true,
    });
  };

  updateChannel = value => {
    this.setState({
      selectedChannel: value,
    });
  };

  render() {
    const { navigation } = this.props;
    const {
      isPoll,
      image,
      resourceText,
      pollData,
      channels,
      selectedChannel,
    } = this.state;

    const displayToolbar = !isPoll && !image;

    let postPlaceholder = 'Write, post, recieve community...';
    if (isPoll) {
      postPlaceholder = 'What questions do you have?';
    }

    return (
      <Container>
        {/* Hack to dismiss keyboard when text isn't focused */}
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          scrollEnabled={false}
        >
          <View style={styles.selectChannelView}>
            <RNPickerSelect
              placeholder={{ label: 'Select a channel...', value: null }}
              value={selectedChannel}
              items={channels || []}
              onValueChange={this.updateChannel}
              style={{
                // uses inputAndroid and inputiOS style from the stylesheet
                ...styles,
                iconContainer: {
                  top: 10,
                  left: 12,
                },
              }}
              Icon={() => (
                <Image
                  source={require('../../assets/channel-list.png')}
                  style={styles.channelImage}
                />
              )}
            />
          </View>
          <View style={styles.postContentView}>
            <Textarea
              bordered
              placeholder={postPlaceholder}
              style={styles.textBox}
              onChangeText={this.textUpdate}
              value={resourceText}
              rowSpan={3}
            />
          </View>

          <View style={styles.ToolbarView}>
            <Toolbar
              pickImage={this.pickImage}
              takeImage={this.takeImage}
              addPoll={this.addPoll}
              clearMedia={this.clearMedia}
              image={image}
              mediaSelected={displayToolbar}
            />
          </View>
          <View style={styles.mediaPreviewView}>
            <MediaPreview
              image={image}
              poll={pollData}
              isPoll={isPoll}
              updatePoll={this.updatePoll}
              removeMedia={this.clearMedia}
              loggedInUser={navigation.getParam('loggedInUser')}
            />
          </View>
        </KeyboardAwareScrollView>
      </Container>
    );
  }
}
