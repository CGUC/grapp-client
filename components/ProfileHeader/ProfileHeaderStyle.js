import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  profileHeader: {
    alignSelf: 'stretch',
    height: 180,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    elevation: 5,
    paddingTop: 28,
  },
  profilePicture: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 20,
  },
  profileNameText: {
    fontFamily: 'Roboto',
    fontSize: 20,
    textAlign: 'center',
  },
  profileText: {
    padding: 50,
    fontSize: 30,
    color: '#ffffff',
    fontFamily: 'Roboto',
  },
  settingsIcon: {
    width: 50,
    height: 50,
  },
  helpIcon: {
    width: 50,
    height: 50,
  },
});
