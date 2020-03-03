import React from 'react';
import Autolink from 'react-native-autolink';
import { TouchableOpacity, View, Modal } from 'react-native';
import { Text, Thumbnail, Card, CardItem, Button } from 'native-base';
import * as Font from 'expo-font';
import date from 'date-fns';

import styles from './CommentStyle';
import { getProfilePicture } from '../../helpers/imageCache';
import CommentEditor from '../CommentEditor/CommentEditor';

export default class Comment extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      profilePicture: null,
      showEditButtons: false,
      editing: false,
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
  }

  onPressComment = () => {
    if (this.props.enableEditing || this.props.enableDeleting) {
      this.setState({ showEditButtons: true });
    }
  };

  hideEditButtons = () => {
    this.setState({ showEditButtons: false });
  };

  onPressEdit = () => {
    this.setState({ editing: true });
    this.hideEditButtons();
  };

  saveEdited = (commentId, newComment) => {
    const { updateComment, data } = this.props;

    const cid = data._id || commentId;
    data.content = newComment.content;

    this.closeEditingModal();

    return updateComment && updateComment(cid, data, 'updateComment');
  };

  closeEditingModal = () => {
    this.setState({ editing: false });
  };

  onPressDelete = () => {
    const { updateComment, data } = this.props;

    const commentId = data._id;

    this.hideEditButtons();

    return updateComment && updateComment(commentId, {}, 'deleteComment');
  };

  render() {
    const { showEditButtons, editing } = this.state;

    const { data, showUserProfile, enableEditing } = this.props;

    const { author, content } = data;
    let { createdAt } = data;

    let authorName;
    if (!author) authorName = 'Ghost';
    else authorName = `${author.firstName} ${author.lastName}`;

    if (date.isPast(date.addWeeks(createdAt, 1))) {
      // If the post is more than a week old, display date
      createdAt = date.format(createdAt, 'ddd MMM Do');
    } else {
      // Display how long ago the post was made
      createdAt = date.distanceInWordsToNow(createdAt, { addSuffix: true });
    }

    if (editing) {
      return (
        <CommentEditor
          author={author}
          updateResource={this.saveEdited}
          commentData={content}
        />
      );
    }

    return (
      <View>
        <Card style={styles.card}>
          <CardItem style={styles.cardItem}>
            <View style={styles.textContainer}>
              <TouchableOpacity onPress={() => showUserProfile(author)}>
                <Thumbnail
                  small
                  style={styles.profilePicThumbnail}
                  source={{
                    uri: `data:image/png;base64,${this.state.profilePicture}`,
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={this.onPressComment}
                hitSlop={{
                  top: 15,
                  bottom: 15,
                  left: 10,
                  right: 10,
                }}
              >
                <View style={styles.title}>
                  <Text style={styles.textAuthor}>{`${authorName} `}</Text>
                  <Text note>{`${createdAt} `}</Text>
                </View>
                <Autolink text={content} style={styles.textContent} />
              </TouchableOpacity>
            </View>
          </CardItem>
        </Card>

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
              <View style={styles.view}>
                {enableEditing && (
                  <Button
                    block
                    style={styles.editButton}
                    onPress={this.onPressEdit}
                  >
                    <Text>Edit Comment</Text>
                  </Button>
                )}
                <Button
                  block
                  style={styles.deleteButton}
                  onPress={this.onPressDelete}
                >
                  <Text>Delete Comment</Text>
                </Button>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </View>
    );
  }
}
