import React from 'react';
import { FlatList, Text, Image, TouchableOpacity } from 'react-native';
import {
  Container,
  Content,
  Item,
  Input,
  Icon,
  Header,
  View,
  Thumbnail,
} from 'native-base';
import * as Font from 'expo-font';

import _ from 'lodash';
import UserListItem from '../../components/UserListItem/UserListItem';
import UserProfile from '../../components/UserProfile/UserProfile';
import Spinner from '../../components/Spinner/Spinner';
import styles from './MemberListStyle';
import defaultStyles from '../../styles/styles';
import ApiClient from '../../ApiClient';
import { getProfilePicture } from '../../helpers/imageCache';

/**
 * Searchable list of all members on the app to provide quick access to profiles
 */

// Will only render a small number of user cards at a time for better performance
const CHUNK_LIMIT = 15;

function sortAlphabetically(members) {
  return members.sort((m1, m2) => {
    if (m1.firstName < m2.firstName) return -1;
    if (m1.firstName > m2.firstName) return 1;
    if (m1.lastName < m2.lastName) return -1;
    if (m1.lastName > m2.lastName) return 1;
    return 0;
  });
}

export default class MemberList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      members: [],
      filteredMembers: [],
      filter: undefined,
      useFiltered: false,
      page: 1,
      loading: true,
      loadedLastPage: false,
      userDataToShow: undefined,
      showProfileModal: false,
      profilePicture: undefined,
    };
  }

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require('../../node_modules/native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('../../node_modules/native-base/Fonts/Roboto_medium.ttf'),
    });

    getProfilePicture(this.props.navigation.getParam('user')._id).then(
      response => {
        this.setState({
          profilePicture: response,
        });
      },
    );

    await this.loadMembers();
  }

  getSearchAdornmentJSX() {
    const { useFiltered, filter } = this.state;

    if (!filter) {
      return <Icon name="ios-people" />;
    }
    if (useFiltered) {
      return (
        <TouchableOpacity onPress={this.clearFilter}>
          <Icon name="ios-close-circle-outline" />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity onPress={this.searchMembers}>
        <Icon name="arrow-forward" />
      </TouchableOpacity>
    );
  }

  listFooter = () => {
    const { loadedLastPage } = this.state;

    if (!loadedLastPage) {
      return <Spinner />;
    }
    return <Text style={styles.noMoreUsers}>That's everyone!</Text>;
  };

  closeProfileModal = () => {
    this.setState({
      userDataToShow: undefined,
      showProfileModal: false,
    });
  };

  searchMembers = () => {
    const { filter, members } = this.state;
    const filtered = _.filter(members, member => {
      let name = member.firstName + member.lastName;
      name = name.toLowerCase();
      return name.match(new RegExp(filter));
    });

    this.setState({
      useFiltered: true,
      filteredMembers: filtered,
      page: 1,
      loadedLastPage: false,
    });
  };

  clearFilter = () => {
    this.setState({
      filteredMembers: [],
      filter: undefined,
      useFiltered: false,
      page: 1,
      loadedLastPage: false,
    });
  };

  loadNextChunk = async () => {
    const { page, members, useFiltered, filteredMembers } = this.state;

    const membersToShow = useFiltered ? filteredMembers : members;

    if (page * CHUNK_LIMIT < membersToShow.length) {
      this.setState({ page: page + 1 });
    } else {
      this.setState({ loadedLastPage: true });
    }
  };

  renderListItem = ({ item }) => (
    <UserListItem user={item} showUserProfile={this.showUserProfile} />
  );

  showUserProfile = user => {
    this.setState({
      userDataToShow: user,
      showProfileModal: true,
    });
  };

  loadMembers = async () => {
    this.setState({
      loading: true,
      page: 1,
      loadedLastPage: false,
      filteredMembers: [],
      filter: undefined,
      useFiltered: false,
    });

    ApiClient.get('/users', { authorized: true })
      .then(users => {
        this.setState({
          members: sortAlphabetically(users),
          loading: false,
        });
      })
      .catch(err => {
        console.error(err);
      });
  };

  static navigationOptions = {
    title: 'Members',
    headerTitle: null,
  };

  buildListItems() {
    const membersToRender = this.chunkItemsToRender();

    return membersToRender.map((user, index) => ({
      ...user,
      key: `user-${index}`,
    }));
  }

  chunkItemsToRender() {
    const { members, page, useFiltered, filteredMembers } = this.state;

    const membersToShow = useFiltered ? filteredMembers : members;

    const startIndex = 0;
    const endIndex = Math.min(page * CHUNK_LIMIT, membersToShow.length);

    return _.slice(membersToShow, startIndex, endIndex);
  }

  render() {
    const { loading, filter, userDataToShow, showProfileModal } = this.state;

    const searchAdornmentJSX = this.getSearchAdornmentJSX();

    if (loading) {
      return (
        <Container style={defaultStyles.backgroundTheme}>
          <Content>
            <Spinner />
          </Content>
        </Container>
      );
    }
    const user = this.props.navigation.getParam('user');
    return (
      <Container style={defaultStyles.backgroundTheme}>
        {/* Edit profile button */}
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate('EditProfile', { user });
          }}
          style={styles.editProfileButton}
        >
          <View>
            <Thumbnail
              source={{
                uri: `data:image/png;base64,${this.state.profilePicture}`,
              }}
            />
          </View>
          <Text style={styles.editProfileText}>
            {`${user.firstName} ${user.lastName}`}
          </Text>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            <Image
              source={require('../../assets/arrowright.png')}
              style={styles.rightArrow}
            />
          </View>
        </TouchableOpacity>
        <Container style={defaultStyles.backgroundTheme}>
          <Header
            searchBar
            rounded
            transparent
            style={{
              paddingTop: 0,
            }}
          >
            <Item>
              <Icon name="ios-search" style={{ marginBottom: 2 }} />
              <Input
                {...(filter ? {} : { value: '' })}
                placeholder="search"
                autoCorrect={false}
                onChangeText={text =>
                  this.setState({ filter: text.toLowerCase() })
                }
                onSubmitEditing={this.searchMembers}
              />
              {searchAdornmentJSX}
            </Item>
          </Header>

          <FlatList
            data={this.buildListItems()}
            renderItem={this.renderListItem}
            onEndReached={this.loadNextChunk}
            refreshing={this.state.loading}
            onRefresh={this.loadMembers}
            onEndReachedThreshold={0.5}
            ListFooterComponent={this.listFooter()}
          />

          <UserProfile
            user={userDataToShow}
            onClose={this.closeProfileModal}
            isModalOpen={showProfileModal}
          />
        </Container>
      </Container>
    );
  }
}
