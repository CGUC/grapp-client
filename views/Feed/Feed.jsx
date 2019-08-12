/**
 * Screen to display a feed of relevant posts in a scrollable list.
 * TODO: This should probably be re-used for All Feed and My Subs, receiving specificity through props
*/

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { FlatList} from 'react-native';
import { Container, Footer, Content, Spinner, Text } from 'native-base';
import { Font, AppLoading } from "expo";
import ContentBar from '../../components/ContentBar/ContentBar';
import UserProfile from '../../components/UserProfile/UserProfile.jsx';
import Post from '../../components/Post/Post';
import NoData from '../../components/NoData/NoData';
import ApiClient from '../../ApiClient';
import styles from './FeedStyle';
import defaultStyles from '../../styles/styles';
import {setPostPicture} from '../../helpers/imageCache';
import { createPoll } from '../../helpers/poll';

export default class FeedView extends React.Component {

  static navigationOptions = ({ navigation }) => {
    var channel = navigation.getParam('channel')
    if (channel) title = channel.name;
    else title = 'Feed';

    return {
      title: title,
      headerTitle: null,
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      loading: true,
      user: {},
      loadingPage: false,
      page: 1,
      loadedLastPage: false,
      userDataToShow: undefined,
      showProfileModal: false
    }
  }

  async componentWillMount() {

    await Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
    });

    await this.loadData();

    this.setState({ loading: false });
  }

  getUri() {
    const loggedInUser = this.props.navigation.getParam('loggedInUser');

    var channel = this.props.navigation.getParam('channel');
    if (!channel) channel = { _id: 'all' };

    if ('all' === channel._id) {
      return '/posts'
    }
    else if ('subs' === channel._id) {
      return `/users/${loggedInUser._id}/subscribedChannels/posts`;
    }
    else if ('myPosts' === channel._id) {
      return `/posts/user/${loggedInUser._id}`;
    }
    return `/channels/${channel._id}/posts`;
  }

  loadData = async () => {
    this.setState({
      loading: true,
      page: 1,
      loadedLastPage: false
    });
    const loggedInUser = this.props.navigation.getParam('loggedInUser');
    await ApiClient.get(this.getUri(), {authorized: true})
      .then(response => {
        this.setState({
          posts: response,
          loading: false,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  addPost = (data) => {
    /**
     * Currently data is just a string of text
     */
    const {
      navigation,
    } = this.props;

    const loggedInUser = navigation.getParam('loggedInUser');
    console.log(`my user ID: ${loggedInUser._id}`)

    var channel = navigation.getParam('channel');
    if (['all', 'subs'].includes(channel._id)) return console.error(`Can't add post to ${channel._id} feed`);

    var tags = channel.tags;

    var postContent = {
      author: loggedInUser._id,
      content: data.content,
      tags: tags
    }
    if (data.poll) {
      postContent.content = data.poll.title;
    }
    ApiClient.post('/posts', postContent, {authorized: true})
    .then(response => response.json())
    .then(post => {
      if (data.poll) {
        createPoll(post._id, data.poll).then(poll => {
          if (data.image) {
            setPostPicture(
              post._id,
              data.image
            ).then(() => this.loadData());
          }
          else {
            this.loadData();
          }
        })
        .catch((err) => {
          alert("Error creating poll. Sorry about that!")
        });
      } else if (data.image) {
        setPostPicture(
          post._id,
          data.image
        ).then(() => this.loadData());
      }
      else {
        this.loadData();
      }
    });
  }

  updatePost = async (postId, data, type) => {
    if (type === 'toggleLike') {
      const loggedInUser = this.props.navigation.getParam('loggedInUser');
      const addLike = data.usersLiked.some(user => user._id === loggedInUser._id);

      return ApiClient.post(`/posts/${postId}/like`, { addLike }, {authorized: true})
        .then(() => {
          this.updateState('updatePost', data);
        })
        .catch(err => {
          alert("Error liking post. Sorry about that!")
        });
    }
    else if (type === 'deletePost') {
      return ApiClient.delete(`/posts/${postId}`, {authorized: true})
        .then(() => {
          this.updateState('deletePost', postId);
        })
        .catch(err => {
          alert("Error deleting post. Sorry about that!")
        });
    }
    else if (type === 'editPost') {
      this.updateState('updatePost', data);
    }
    else if (type === 'editPoll') {
      return createPoll(postId, data).then(poll => {
        this.updateState('updatePoll', { _id: postId, poll: poll });
      })
      .catch(err => {
        alert("Error updating post. Sorry about that!")
      });
    }

    ApiClient.put(`/posts/${postId}`, _.pick(data, ['content', 'image']), {authorized: true})
      .then(() => {
        //this.loadData();
      })
      .catch(err => {
        alert("Error updating post. Sorry about that!");
      });
  }

  /**
   * Allows sub views to update feed data
   */
  updateState = (type, data) => {
    if (type === 'updatePost') {
      this.setState({
        posts: this.state.posts.map(post => {
          if (post._id === data._id) return data;
          return post;
        })
      });
    } else if (type === 'deletePost') {
      this.setState({
        posts: this.state.posts.filter(post => {
          return post._id !== data;
        })
      });
    } else if (type === 'updatePoll') {
      this.setState({
        posts: this.state.posts.map(post => {
          if (post._id === data._id) {
            post.media.poll = data.poll;
          }
          return post;
        })
      });
    }
  }

  onPressPost = (postData) => {
    const { navigation } = this.props;
    const loggedInUser = navigation.getParam('loggedInUser');

    var updateParentState = this.updateState;
    this.props.navigation.navigate('Comments', { postData, updateParentState, loggedInUser });
  }

  showUserProfile = (user) => {
    this.setState({
      userDataToShow: user,
      showProfileModal: true
    })
  }

  closeProfileModal = () => {
    this.setState({
      userDataToShow: undefined,
      showProfileModal: false
    })
  }

  getFooterJSX() {
    const {
      navigation,
    } = this.props;

    var channel = navigation.getParam('channel');
    const loggedInUser = navigation.getParam('loggedInUser');

    if (!['all', 'subs', 'myPosts'].includes(channel._id)) {
      return (
        <Footer>
          <ContentBar
            addResource={this.addPost}
            submitButtonText='Post'
            showModalToolbar={true}
            loggedInUser={loggedInUser}
          />
        </Footer>
      )
    }
    return null;
  }

  buildListItems() {
    items = this.state.posts.map(post => {
      post.key = post._id;
      return post;
    });
    return items;
  }

  renderListItem = ({ item }) => {
    const loggedInUser = this.props.navigation.getParam('loggedInUser')
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
        updatePost={this.updatePost}
        showTag={['all', 'subs', 'myPosts'].includes(channelId)}
        enableEditing={enableEditing}
        enableDeleting={loggedInUser.role && loggedInUser.role.includes("admin")}
        showUserProfile={this.showUserProfile}
        showFullDate={false}
      />
    );
  }

  loadNextPage = async () => {
    if (this.state.loadingPage || this.state.loadedLastPage) return;
    this.setState({
      page: this.state.page + 1,
      loadingPage: true,
    }, state =>
        ApiClient.get(this.getUri(), {authorized: true, headers: { 'page': this.state.page }}).then(response => {

          this.setState({
            posts: [...this.state.posts, ...response],
            loadingPage: false,
            loadedLastPage: response.length < 15
          });
        })
          .catch((err) => {
            console.error(err);
          })
    );
  }

  listFooter = () => {
    if (this.state.loadingPage) {
      return <Spinner color='#cd8500' />;
    }
    else if (this.state.loadedLastPage) {
      return <Text style={styles.noMorePosts}>No more posts!</Text>;
    }
    else return null;
  }

  render() {
    const {
      posts,
      loading,
      userDataToShow,
      showProfileModal
    } = this.state;

    const {
      navigation,
    } = this.props;

    const channelId = navigation.getParam('channel')._id;
    const loggedInUser = navigation.getParam('loggedInUser');

    if (loading) {
      return (
        <Container style={defaultStyles.backgroundTheme}>
          <Content>
            <Spinner color='#cd8500' />
          </Content>
        </Container>
      );
    } else if (posts.length) {
      return (
        <Container style={defaultStyles.backgroundTheme}>
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

          {this.getFooterJSX()}

          <UserProfile
            user={userDataToShow}
            onClose={this.closeProfileModal}
            isModalOpen={showProfileModal}
          />

        </Container>
      )
    } else {
      var message;
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
        <NoData
          message={message}
          addResource={this.addPost}
          hideFooter={['all', 'subs', 'myPosts'].includes(channelId)}
          loggedInUser={loggedInUser}
        />
      );
    }
  }
}
