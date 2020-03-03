import React from 'react';
import { ImageBackground } from 'react-native';
import { Container, Content } from 'native-base';
import ApiClient from '../../ApiClient';
import styles from './SplashStyle';
import notificationToken from '../../helpers/notificationToken';
import Spinner from '../../components/Spinner/Spinner';

export default class SplashScreen extends React.Component {
  componentWillMount() {
    ApiClient.get('/users/loggedInUser', { authorized: true })
      .then(user => {
        if (user._id) {
          notificationToken.registerForPushNotificationsAsync(user);
          this.props.navigation.navigate('Home', { user });
        } else {
          this.props.navigation.navigate('Auth');
        }
      })
      .catch(() => this.props.navigation.navigate('Auth'));
  }

  static navigationOptions = { header: null };

  render() {
    return (
      <ImageBackground
        style={styles.background}
        source={require('../../assets/splash.png')}
      >
        <Container>
          <Content contentContainerStyle={styles.contentContainer}>
            <Spinner />
          </Content>
        </Container>
      </ImageBackground>
    );
  }
}
