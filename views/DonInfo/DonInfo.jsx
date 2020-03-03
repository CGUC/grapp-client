import React from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { Container, Content, Icon } from 'native-base';
import * as Font from 'expo-font';
import UserProfile from '../../components/UserProfile/UserProfile';
import DonStatusCard from '../../components/DonStatusCard/DonStatusCard';
import styles from './DonInfoStyle';
import defaultStyles from '../../styles/styles';
import ApiClient from '../../ApiClient';
import Spinner from '../../components/Spinner/Spinner';

export default class DonInfo extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: null,
    title: 'Find a Don',
    get headerRight() {
      const state = navigation.getParam('saveState');
      if (!state || state === 'disabled') return null;
      if (state === 'hasChanges') {
        return (
          <TouchableOpacity onPress={navigation.getParam('save')}>
            <Icon type="MaterialIcons" name="save" style={styles.icon} />
          </TouchableOpacity>
        );
      }
      if (state === 'saving') {
        return (
          <View style={{ marginRight: 20 }}>
            <Spinner size="small" color="white" />
          </View>
        );
      }
      if (state === 'saved') {
        return <Icon type="MaterialIcons" name="check" style={styles.icon} />;
      }

      return null;
    },
  });

  constructor(props) {
    super(props);
    this.state = {
      dons: [],
      loading: true,
      userDataToShow: undefined,
      showProfileModal: false,
    };
  }

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require('../../node_modules/native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('../../node_modules/native-base/Fonts/Roboto_medium.ttf'),
    });
    await this.loadDons();
  }

  componentDidMount() {
    const { navigation } = this.props;

    navigation.setParams({
      save: this.onSave,
      saveState: 'disabled',
    });
  }

  loadDons = async () => {
    this.setState({
      loading: true,
    });

    ApiClient.get('/users', { authorized: true })
      .then(users => {
        const dons = users
          .filter(
            user =>
              user.role &&
              (user.role.includes('don') ||
                user.role.includes('superintendent')),
          )
          .map(user => (user.donInfo ? user : { ...user, donInfo: {} }));

        this.setState({
          dons: this.sortDons(dons),
          loading: false,
        });
      })
      .catch(err => {
        console.error(err);
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

  onSave = async () => {
    const { navigation } = this.props;

    navigation.setParams({ saveState: 'saving' });
    try {
      const { dons } = this.state;

      const requests = [];
      for (let i = 0; i < dons.length; i++) {
        requests.push(
          ApiClient.post(`/users/${dons[i]._id}/doninfo`, dons[i].donInfo, {
            authorized: true,
          }),
        );
      }

      await Promise.all(requests);
      navigation.setParams({ saveState: 'saved' });
    } catch (err) {
      alert('Error updating don information. Sorry about that!');
      console.error(err);
    }
  };

  handleCardChanged = () => {
    const { navigation } = this.props;
    navigation.setParams({ saveState: 'hasChanges' });
  };

  buildListItems() {
    const { dons } = this.state;
    return dons.map(member => ({
      ...member,
      key: member._id,
    }));
  }

  sortDons(dons) {
    const { navigation } = this.props;

    dons.sort((m1, m2) => {
      if (m1.role.includes('superintendent')) return 1;
      if (m2.role.includes('superintendent')) return -1;
      // Put yourself at the top
      if (m1._id === navigation.getParam('user')._id) return -1;
      if (m2._id === navigation.getParam('user')._id) return 1;

      // Put on dons next
      if (m1.donInfo.isOn && !m2.donInfo.isOn) return -1;
      if (m2.donInfo.isOn && !m1.donInfo.isOn) return 1;

      // Put late supper dons next
      if (m1.donInfo.isOnLateSupper && !m2.donInfo.isOnLateSupper) return -1;
      if (m2.donInfo.isOnLateSupper && !m1.donInfo.isOnLateSupper) return 1;

      // Alphabetically sort the rest
      if (m1.firstName < m2.firstName) return -1;
      if (m1.firstName > m2.firstName) return 1;
      return 0;
    });
    return dons;
  }

  renderListItem = ({ item }) => {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    // If item is superintendent, there is nothing to edit
    if (item.role && item.role.includes('superintendent')) {
      return (
        <DonStatusCard
          isSuperintendent
          don={item}
          onOpenProfile={this.showUserProfile}
        />
      );
    }

    // if the current user is the don, enable editting
    const userIsThisDon = user._id === item._id;
    const userIsDon = user.role && user.role.includes('don');
    return (
      <DonStatusCard
        don={item}
        togglable={userIsDon}
        editable={userIsThisDon}
        onChange={this.handleCardChanged}
        onOpenProfile={this.showUserProfile}
      />
    );
  };

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
        <FlatList
          data={this.buildListItems()}
          renderItem={this.renderListItem}
          refreshing={loading}
          onRefresh={this.loadDons}
        />

        <UserProfile
          user={userDataToShow}
          onClose={this.closeProfileModal}
          isModalOpen={showProfileModal}
        />
      </Container>
    );
  }
}
