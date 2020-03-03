/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  createStackNavigator,
  createSwitchNavigator,
  createAppContainer,
} from 'react-navigation';
import { Image, TouchableOpacity } from 'react-native';
import HomeView from './views/Home/Home';
import LoginView from './views/Login/Login';
import FeedView from './views/Feed/Feed';
import CreatePostView from './views/CreatePost/CreatePost';
import CommentsView from './views/Comments/Comments';
import SplashScreen from './views/Splash/Splash';
import SettingsView from './views/Settings/Settings';
import MemberListView from './views/MemberList/MemberList';
import DonInfoView from './views/DonInfo/DonInfo';
import EditProfileView from './views/EditProfile/EditProfile';
import defaultStyle from './styles/styles';

const AppStack = createStackNavigator(
  {
    Home: HomeView,
    Feed: FeedView,
    CreatePost: CreatePostView,
    Comments: CommentsView,
    Settings: SettingsView,
    MemberList: MemberListView,
    DonInfo: DonInfoView,
    EditProfile: EditProfileView,
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      headerTitle: (
        <TouchableOpacity
          style={{ marginLeft: 'auto', marginRight: 'auto' }}
          onPress={() => {
            navigation.navigate('Home');
          }}
        >
          <Image
            source={require('./assets/header-logo.png')}
            style={{ height: 40, width: 40 }}
          />
        </TouchableOpacity>
      ),
      headerStyle: defaultStyle.primaryColor,
      headerTintColor: '#FFFFFF',
    }),
  },
);

export default createAppContainer(
  createSwitchNavigator(
    {
      Splash: SplashScreen,
      Auth: LoginView,
      App: AppStack,
    },
    { initialRouteName: 'Splash' },
  ),
);
