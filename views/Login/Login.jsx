import React from 'react';
import {
  ImageBackground,
  View,
  Image,
  KeyboardAvoidingView,
  Linking,
  StatusBar,
} from 'react-native';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';
import { Container, Content, Text, Button, Input, Item } from 'native-base';
import notificationToken from '../../helpers/notificationToken';
import Banner from '../../components/Banner/Banner';
import ApiClient from '../../ApiClient';
import styles from './LoginStyle';
import Spinner from '../../components/Spinner/Spinner';

const contactWebmasters = () => {
  Linking.openURL('mailto:webmaster@grebelife.com?subject=Skybunk%20Help%20');
};

export default class LoginView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      registering: false,
      username: null,
      password: null,
      firstName: null,
      lastName: null,
      goldenTicket: null,
      loading: true,
      processing: false,
    };
  }

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require('../../node_modules/native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('../../node_modules/native-base/Fonts/Roboto_medium.ttf'),
    });
    this.setState({ loading: false });
  }

  toggleRegistering = () => {
    const { registering } = this.state;
    this.setState({
      registering: !registering,
      errorMessage: null,
    });
  };

  submitForm = () => {
    // Register the user
    if (this.state.registering) {
      this.setState({ processing: true });
      ApiClient.register({
        username: this.state.username,
        password: this.state.password,
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        goldenTicket: this.state.goldenTicket,
      })
        .then(jsonResponse => {
          if (jsonResponse.message) {
            this.setState({
              errorMessage: jsonResponse.message, // TODO: Fix error from server and update here
              processing: false,
              successMessage: null,
            });
          } else {
            this.setState({
              firstName: null,
              lastName: null,
              goldenTicket: null,
              registering: false,
              processing: false,
              errorMessage: null,
              successMessage: 'Account successfully created',
            });
          }
        })
        .catch(err => {
          console.error(err);
        });
    } else {
      this.setState({ processing: true });
      ApiClient.login(this.state.username, this.state.password)
        .then(response => response.json())
        .then(jsonResponse => {
          if (jsonResponse.err) {
            this.setState({
              errorMessage: jsonResponse.err.message,
              successMessage: null,
              processing: false,
            });
          } else {
            ApiClient.setServers(jsonResponse)
              .then(() => {
                ApiClient.get('/users/loggedInUser', { authorized: true })
                  .then(user => {
                    notificationToken.registerForPushNotificationsAsync(user);
                    this.props.navigation.navigate('Home', {
                      token: jsonResponse[0].token,
                      user,
                    });
                  })
                  .catch(err => console.error(err));
              })
              .catch(error => {
                console.error(error);
                this.setState({
                  errorMessage: 'Sorry, there was an error logging you in',
                  successMessage: null,
                  processing: false,
                });
              });
          }
        })
        .catch(err => {
          console.error(err);
          this.setState({
            errorMessage: err.message,
            successMessage: null,
            processing: false,
          });
        });
    }
  };

  updateFormStateFunc(key) {
    return text => {
      this.setState({
        [key]: text,
      });
    };
  }

  static navigationOptions = { header: null };

  render() {
    StatusBar.setBarStyle('dark-content', true);

    const registerFields = (
      <View>
        <Item regular style={styles.inputItem}>
          <Input
            placeholder="First Name"
            onChangeText={this.updateFormStateFunc('firstName')}
          />
        </Item>
        <Item regular style={styles.inputItem}>
          <Input
            placeholder="Last Name"
            onChangeText={this.updateFormStateFunc('lastName')}
          />
        </Item>
        <Item regular style={styles.inputItem}>
          <Input
            placeholder="Golden Ticket #"
            onChangeText={this.updateFormStateFunc('goldenTicket')}
          />
        </Item>
      </View>
    );

    const logoIcon = (
      <View>
        <Image
          source={require('../../assets/login-logo.png')}
          style={styles.loginLogo}
        />
      </View>
    );

    if (this.state.loading) {
      return (
        <Container>
          <AppLoading />
        </Container>
      );
    }
    return (
      <Container>
        <ImageBackground
          style={styles.background}
          source={require('../../assets/login-bg.png')}
        >
          <Content contentContainerStyle={{ flex: 1, alignItems: 'center' }}>
            <KeyboardAvoidingView
              style={styles.loginInputGroup}
              flex={this.state.registering ? 0.7 : 0.75}
              behavior="padding"
              enabled
            >
              {this.state.registering ? null : logoIcon}

              <Text style={styles.loginTitle}>
                {this.state.registering ? 'Register' : 'Sign In'}
              </Text>

              <Item regular last style={styles.inputItem}>
                <Input
                  placeholder="Username"
                  onChangeText={this.updateFormStateFunc('username')}
                />
              </Item>
              <Item regular style={styles.inputItem}>
                <Input
                  placeholder="Password"
                  secureTextEntry
                  onChangeText={this.updateFormStateFunc('password')}
                />
              </Item>

              {this.state.registering ? registerFields : null}
            </KeyboardAvoidingView>

            <View
              style={styles.loginButtonsGroup}
              flex={this.state.registering ? 0.2 : 0.35}
            >
              {this.state.errorMessage ? (
                <Banner error message={this.state.errorMessage} />
              ) : null}
              {this.state.successMessage ? (
                <Banner success message={this.state.successMessage} />
              ) : null}

              <Button
                block
                onPress={this.submitForm}
                style={styles.loginButton}
                disabled={this.state.processing}
              >
                <Text>{this.state.registering ? 'Register' : 'Login'}</Text>
              </Button>
              <Button dark transparent block onPress={this.toggleRegistering}>
                <Text>
                  {this.state.registering
                    ? 'Already have an account?'
                    : "Don't have an account?"}
                </Text>
              </Button>
              <Button dark transparent block onPress={contactWebmasters}>
                <Text>Contact the webmasters!</Text>
              </Button>

              {this.state.processing ? <Spinner color="black" /> : null}
            </View>
          </Content>
        </ImageBackground>
      </Container>
    );
  }
}
