import React from 'react';
import { Container, Content, Text } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Font from 'expo-font';

import _ from 'lodash';
import Post from '../../components/Post/Post';
import Comment from '../../components/Comment/Comment';
import UserProfile from '../../components/UserProfile/UserProfile';
import ApiClient from '../../ApiClient';
import styles from './CommentsStyle';
import defaultStyles from '../../styles/styles';
import CommentEditor from '../../components/CommentEditor/CommentEditor';
import Spinner from '../../components/Spinner/Spinner';

export default class CommentsView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const postData = navigation.getParam('postData');
    let title;
    if (postData) {
      if (postData.author)
        title = `Comments on ${postData.author.firstName}'s post`;
      else title = 'Comments';
    }

    return {
      headerTitle: null,
      title,
    };
  };

  constructor(props) {
    super(props);

    const postData = props.navigation.getParam('postData');

    this.state = {
      loading: true,
      postData,
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
  }

  updateResource = async (id, data, type) => {
    const { navigation } = this.props;

    const { postData } = this.state;

    const loggedInUser = navigation.getParam('loggedInUser');
    const updateParentState = navigation.getParam('updateParentState');

    if (['toggleLike'].includes(type)) {
      const addLike = data.usersLiked.some(
        user => user._id === loggedInUser._id,
      );

      ApiClient.post(
        `/posts/${postData._id}/like`,
        { addLike },
        { authorized: true },
      )
        .then(() => {
          this.setState({ postData: data });
          updateParentState('updatePost', data);
        })
        .catch(err => {
          console.error(err);
          alert('Error updating post. Sorry about that!');
        });
    } else if (type === 'editPoll') {
      this.setState({ loading: true, postData: data });
      this.loadData().then(() => this.setState({ loading: false }));
      updateParentState('updatePoll', data);
    } else if (type === 'votePoll') {
      updateParentState('updatePoll', data);
    } else if (type === 'deletePost') {
      ApiClient.delete(`/posts/${postData._id}`, { authorized: true })
        .then(() => {
          updateParentState('deletePost', postData._id);
        })
        .catch(() => {
          alert('Error deleting post. Sorry about that!');
        });
      navigation.goBack();
    } else if (type === 'addComment') {
      const commentContent = {
        author: loggedInUser._id,
        content: data.content,
      };
      ApiClient.post(`/posts/${postData._id}/comment`, commentContent, {
        authorized: true,
      })
        .then(() => {
          this.loadData();
        })
        .catch(() => {
          alert('Error adding comment. Sorry about that!');
        });
    } else if (type === 'updateComment') {
      const commentContent = {
        author: loggedInUser._id,
        content: data.content,
      };
      ApiClient.put(`/posts/${postData._id}/comment/${id}`, commentContent, {
        authorized: true,
      })
        .then(() => {
          const updatedPost = {
            ...postData,
            comments: postData.comments.map(comment => {
              if (comment._id === id) return data;
              return comment;
            }),
          };
          this.setState({ postData: updatedPost });
          updateParentState('updatePost', updatedPost);
        })
        .catch(() => {
          alert('Error updating comment. Sorry about that!');
        });
    } else if (type === 'deleteComment') {
      ApiClient.delete(`/posts/${postData._id}/comment/${id}`, {
        authorized: true,
      })
        .then(() => {
          const updatedPost = {
            ...postData,
            comments: postData.comments.filter(comments => comments._id !== id),
          };
          this.setState({ postData: updatedPost });
          updateParentState('updatePost', updatedPost);
        })
        .catch(err => {
          console.error(err);
          alert('Error deleting comment. Sorry about that!');
        });
    }
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

  async loadData() {
    const { navigation } = this.props;
    const { postData } = this.state;

    if (!postData) return;

    const updateParentState = navigation.getParam('updateParentState');
    const postUri = `/posts/${postData._id}`;

    await ApiClient.get(postUri, { authorized: true })
      .then(response => {
        this.setState({ postData: response });

        // Ensure feed view is up-to-date with current:
        updateParentState('updatePost', response);
      })
      .catch(err => {
        console.error(err);
      });
  }

  render() {
    const { navigation } = this.props;

    const { loading, postData, userDataToShow, showProfileModal } = this.state;

    if (!postData) {
      return (
        <Container style={defaultStyles.backgroundTheme}>
          <Content>
            <Text style={styles.noDataText}>
              This post doesn't seem to exist :/
            </Text>
          </Content>
        </Container>
      );
    }

    const loggedInUser = navigation.getParam('loggedInUser');
    const enablePostEditing = postData.author._id === loggedInUser._id;

    const { comments } = postData;

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
        <Content>
          <Post
            data={postData}
            maxLines={1000}
            updatePost={this.updateResource}
            enableEditing={enablePostEditing}
            enableDeleting={
              loggedInUser.role && loggedInUser.role.includes('admin')
            }
            loggedInUser={loggedInUser}
            showUserProfile={this.showUserProfile}
            showFullDate
            navigation={navigation}
          />
          <KeyboardAwareScrollView>
            {_.map(
              _.orderBy(comments, comment => comment.createdAt.valueOf()),
              (comment, key) => {
                const enableCommentEditing =
                  comment.author._id === loggedInUser._id;

                return (
                  <Comment
                    key={`comment${key}`}
                    data={comment}
                    updateComment={this.updateResource}
                    enableEditing={enableCommentEditing}
                    enableDeleting={
                      loggedInUser.role && loggedInUser.role.includes('admin')
                    }
                    showUserProfile={this.showUserProfile}
                  />
                );
              },
            )}
          </KeyboardAwareScrollView>
          <CommentEditor
            author={loggedInUser}
            updateResource={this.updateResource}
          />
        </Content>

        <UserProfile
          user={userDataToShow}
          onClose={this.closeProfileModal}
          isModalOpen={showProfileModal}
        />
      </Container>
    );
  }
}
