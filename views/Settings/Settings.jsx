import React from 'react';
import { TouchableOpacity, Linking, Text } from 'react-native';
import { Container, Content, List, ListItem, Footer } from 'native-base';

import styles from './SettingsStyle';
import defaultStyles from '../../styles/styles';
import ApiClient from '../../ApiClient';
import { clearCache } from '../../helpers/imageCache';
import config from '../../config';

export default class SettingsView extends React.Component {
  showDonInfo = () => {
    const user = this.props.navigation.getParam('user');
    this.props.navigation.navigate('DonInfo', { user });
  };

  logout = () => {
    clearCache();
    ApiClient.clearServers()
      .then(() => {
        this.props.navigation.navigate('Auth');
      })
      .catch(error => {
        console.error(error);
      });
  };

  static navigationOptions = {
    title: 'Settings',
    headerTitle: null,
  };

  render() {
    return (
      <Container>
        <Content contentContainerStyle={styles.contentContainer}>
          <List>
            <ListItem style={{ margin: 0 }}>
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={this.showDonInfo}
              >
                <Text style={styles.itemText}>Find A Don</Text>
              </TouchableOpacity>
            </ListItem>

            <ListItem style={{ margin: 0 }}>
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={this.logout}
              >
                <Text style={styles.itemText}>Logout</Text>
              </TouchableOpacity>
            </ListItem>

            <ListItem style={{ margin: 0 }}>
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => {
                  Linking.openURL('https://grebelife.com/skybunk/feedback');
                }}
              >
                <Text style={styles.itemText}>Send Feedback</Text>
              </TouchableOpacity>
            </ListItem>

            <ListItem style={{ margin: 0 }}>
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => {
                  Linking.openURL(
                    `mailto:webmaster@grebelife.com?subject=Skybunk%20Question%20v${config.VERSION}`,
                  );
                }}
              >
                <Text style={styles.itemText}>Contact Webmasters</Text>
              </TouchableOpacity>
            </ListItem>
          </List>
        </Content>
        <Footer style={defaultStyles.backgroundTheme}>
          <Text style={styles.versionText}>{`Version ${config.VERSION}`}</Text>
        </Footer>
      </Container>
    );
  }
}
