import React from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Text, Thumbnail, Card, CardItem } from 'native-base';
import * as Font from 'expo-font';

import styles from './CommentEditorStyle';
import { getProfilePicture } from '../../helpers/imageCache';

export default class CommentEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      profilePicture: null,
      commentText: this.props.commentData || '',
    };
  }

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require('../../node_modules/native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('../../node_modules/native-base/Fonts/Roboto_medium.ttf'),
    });

    getProfilePicture(this.props.author._id)
      .then(pic => {
        this.setState({
          profilePicture: pic,
        });
      })
      .catch(error => {
        console.error(error);
      });
  }

  textUpdate = text => {
    this.setState({ commentText: text });
  };

  clearComment = () => {
    this.setState({ commentText: '' });
  };

  addComment = () => {
    const { updateResource } = this.props;
    if (updateResource)
      updateResource(
        undefined,
        { content: this.state.commentText },
        'addComment',
      );
    this.clearComment();
  };

  render() {
    const { author } = this.props;

    let authorName;
    if (!author) authorName = 'Ghost';
    else authorName = `${author.firstName} ${author.lastName}`;

    return (
      <View>
        <Card style={styles.card}>
          <CardItem style={styles.cardItem}>
            <View style={styles.textContainer}>
              <View>
                <Thumbnail
                  small
                  style={styles.profilePicThumbnail}
                  source={{
                    uri: `data:image/png;base64,${this.state.profilePicture}`,
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.title}>
                  <Text style={styles.textAuthor}>{`${authorName} `}</Text>
                </View>
                <View style={styles.editorView}>
                  <TextInput
                    style={styles.textContent}
                    placeholder="Join the discussion!"
                    onChangeText={this.textUpdate}
                    value={this.state.commentText}
                    multiline
                  />
                  {this.state.commentText ? (
                    <TouchableOpacity
                      style={styles.commentButton}
                      onPress={this.addComment}
                    >
                      <Text style={styles.commentButtonText}>post</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>
          </CardItem>
        </Card>
      </View>
    );
  }
}
