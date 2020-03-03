/**
 * Screen to display a feed of relevant posts in a scrollable list.
 */

import React from 'react';
import _ from 'lodash';
import { FlatList } from 'react-native';
import { Container, Content, Text, Button, View } from 'native-base';
import * as Font from 'expo-font';
import UserProfile from '../../components/UserProfile/UserProfile';
import Post from '../../components/Post/Post';
import ApiClient from '../../ApiClient';
import styles from './FeedStyle';
import defaultStyles from '../../styles/styles';
import Spinner from '../../components/Spinner/Spinner';

export default class FeedView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const channel = navigation.getParam('channel');
    let title;
    if (channel) title = channel.name;
    else title = 'Feed';

    return {
      title,
      headerTitle: null,
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      loading: true,
      loadingPage: false,
      page: 1,
      loadedLastPage: false,
      userDataToShow: undefined,
      showProfileModal: false,
    };
  }

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require('../../node_modules/native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('../../node_modules/native-base/Fonts/Roboto_medium.ttf'),
    });

    await this.loadData();

    this.setState({ loading: false });

    // refresh data when returning from CreatePost
    this.props.navigation.addListener('willFocus', () => {
      this.loadData();
    });
  }

  getUri() {
    const loggedInUser = this.props.navigation.getParam('loggedInUser');

    let channel = this.props.navigation.getParam('channel');
    if (!channel) channel = { _id: 'all' };

    if (channel._id === 'all') {
      return '/posts';
    }
    if (channel._id === 'subs') {
      return `/users/${loggedInUser._id}/subscribedChannels/posts`;
    }
    if (channel._id === 'myPosts') {
      return `/posts/user/${loggedInUser._id}`;
    }
    return `/channels/${channel._id}/posts`;
  }

  loadData = async () => {
    this.setState({
      loading: true,
      page: 1,
      loadedLastPage: false,
    });

    await ApiClient.get(this.getUri(), { authorized: true })
      .then(response => {
        this.setState({
          posts: response,
          loading: false,
        });
      })
      .catch(err => {
        console.error(err);
      });
  };

  updatePost = async (postId, data, type) => {
    if (type === 'toggleLike') {
      const loggedInUser = this.props.navigation.getParam('loggedInUser');
      const addLike = data.usersLiked.some(
        user => user._id === loggedInUser._id,
      );

      return ApiClient.post(
        `/posts/${postId}/like`,
        { addLike },
        { authorized: true },
      )
        .then(() => {
          this.updateState('updatePost', data);
        })
        .catch(() => {
          alert('Error liking post. Sorry about that!');
        });
    }
    if (type === 'deletePost') {
      return ApiClient.delete(`/posts/${postId}`, { authorized: true })
        .then(() => {
          this.updateState('deletePost', postId);
        })
        .catch(() => {
          alert('Error deleting post. Sorry about that!');
        });
    }

    return ApiClient.put(
      `/posts/${postId}`,
      _.pick(data, ['content', 'image']),
      {
        authorized: true,
      },
    )
      .then(() => {
        this.loadData();
      })
      .catch(err => {
        console.error(err);
        alert('Error deleting post. Sorry about that!');
      });
  };

  /**
   * Allows sub views to update feed data
   */
  updateState = (type, data) => {
    const { posts } = this.state;

    if (type === 'updatePost') {
      this.setState({
        posts: posts.map(post => {
          if (post._id === data._id) return data;
          return post;
        }),
      });
    } else if (type === 'deletePost') {
      this.setState({
        posts: posts.filter(post => post._id !== data),
      });
    } else if (type === 'updatePoll') {
      this.setState({
        posts: posts.map(post => {
          if (post._id === data._id) return data;
          return post;
        }),
      });
      this.loadData();
    }
  };

  onPressPost = postData => {
    const { navigation } = this.props;
    const loggedInUser = navigation.getParam('loggedInUser');

    const updateParentState = this.updateState;
    this.props.navigation.navigate('Comments', {
      postData,
      updateParentState,
      loggedInUser,
    });
  };

  showUserProfile = user => {
    this.setState({
      userDataToShow: user,
      showProfileModal: true,
    });
  };

  closeProfileModal = () => {
    this.setState({
      userDataToShow: undefined,
      showProfileModal: false,
    });
  };

  createPost = () => {
    let channel = this.props.navigation.getParam('channel');
    const loggedInUser = this.props.navigation.getParam('loggedInUser');

    if (['all', 'subs', 'myPosts'].includes(channel._id)) {
      channel = null;
    }
    this.props.navigation.navigate('CreatePost', { channel, loggedInUser });
  };

  renderListItem = ({ item }) => {
    const loggedInUser = this.props.navigation.getParam('loggedInUser');
    // Concept of editing includes deleting; deleting does not include editing.
    const enableEditing = item.author._id === loggedInUser._id;
    const channelId = this.props.navigation.getParam('channel')._id;

    return (
      <Post
        loggedInUser={loggedInUser}
        data={item}
        maxLines={10}
        key={item._id}
        onPressPost={this.onPressPost}
        showTag={['all', 'subs', 'myPosts'].includes(channelId)}
        enableEditing={enableEditing}
        enableDeleting={
          loggedInUser.role && loggedInUser.role.includes('admin')
        }
        showUserProfile={this.showUserProfile}
        showFullDate={false}
        navigation={this.props.navigation}
        updatePost={this.updatePost}
      />
    );
  };

  loadNextPage = async () => {
    if (this.state.loadingPage || this.state.loadedLastPage) return;
    const { page, posts } = this.state;
    this.setState(
      {
        page: page + 1,
        loadingPage: true,
      },
      () =>
        ApiClient.get(this.getUri(), {
          authorized: true,
          headers: { page: this.state.page },
        })
          .then(response => {
            this.setState({
              posts: [...posts, ...response],
              loadingPage: false,
              loadedLastPage: response.length < 15,
            });
          })
          .catch(err => {
            console.error(err);
          }),
    );
  };

  listFooter = () => {
    if (this.state.loadingPage) {
      return <Spinner />;
    }
    if (this.state.loadedLastPage) {
      return <Text style={styles.noMorePosts}>No more posts!</Text>;
    }
    return null;
  };

  getContentJSX = () => {
    if (this.state.posts.length === 0) {
      let message;
      const channelId = this.props.navigation.getParam('channel')._id;
      switch (channelId) {
        case 'subs':
          message = 'Nothing here - try subscribing to a channel!';
          break;
        case 'myPosts':
          message = 'Looks like you haven`t made any posts yet!';
          break;
        default:
          message = 'No posts yet - you could be the first!';
      }
      return (
        <View style={styles.noDataView}>
          <Text style={styles.noDataText}>{message}</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={this.buildListItems()}
        renderItem={this.renderListItem}
        onEndReached={this.loadNextPage}
        ListFooterComponent={this.listFooter()}
        refreshing={this.state.loading}
        onRefresh={this.loadData}
        onEndReachedThreshold={0.8}
        removeClippedSubviews
      />
    );
  };

  buildListItems() {
    return this.state.posts.map(post => ({
      ...post,
      key: post._id,
    }));
  }

  render() {
    const { loading, userDataToShow, showProfileModal } = this.state;

    if (loading) {
      return (
        <Container style={defaultStyles.backgroundTheme}>
          <Content>
            <Spinner />
          </Content>
        </Container>
      );
    }
    return (
      <Container style={defaultStyles.backgroundTheme}>
        {this.getContentJSX()}

        <Button style={styles.newPostButton} onPress={this.createPost}>
          <Text>Make A Post</Text>
        </Button>
        <UserProfile
          user={userDataToShow}
          onClose={this.closeProfileModal}
          isModalOpen={showProfileModal}
        />
      </Container>
    );
  }
}
