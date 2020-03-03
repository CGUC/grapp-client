import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  channelCard: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#CCCCCC',
    borderBottomWidth: 1,
    height: 50,
    paddingLeft: 5,
  },
  channelListButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10,
  },
  channelText: {
    fontSize: 20,
    textAlign: 'left',
  },
  notificationBell: {
    width: 40,
    height: 40,
  },
  rightArrow: {
    width: 40,
    height: 40,
  },
});
