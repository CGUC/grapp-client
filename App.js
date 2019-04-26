import React from 'react'
import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation';
import { Image, TouchableOpacity } from "react-native";
import LoginView from './views/Login/Login';
import HomeView from './views/Home/Home';
import FeedView from './views/Feed/Feed';
import CommentsView from './views/Comments/Comments';
import SplashScreen from './views/Splash/Splash';
import SettingsView from './views/Settings/Settings';
import MemberListView from './views/MemberList/MemberList';
import DonInfoView from './views/DonInfo/DonInfo';
import EditProfileView from './views/EditProfile/EditProfile';
import defaultStyle from './styles/styles'

const AppStack = createStackNavigator(
  {
    Home: HomeView,
    Feed: FeedView,
    Comments: CommentsView,
    Settings: SettingsView,
    MemberList: MemberListView,
    DonInfo: DonInfoView,
    EditProfile: EditProfileView,
  },
  {
    defaultNavigationOptions: (({ navigation }) => {
      return {
        headerTitle: 
        <TouchableOpacity onPress={() => {navigation.navigate('Home')}}>
          <Image source={require('./assets/small-logo.png')} style={{height:40, width:40}}/>
        </TouchableOpacity>,
        headerStyle: defaultStyle.primaryColor,
        headerTintColor: '#FFFFFF'
    }
    }),
  }
);

export default createAppContainer(createSwitchNavigator(
  {
    Splash: SplashScreen,
    Auth: LoginView,
    App: AppStack
  },
  { initialRouteName: 'Splash' }
));
