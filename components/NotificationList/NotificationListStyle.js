import { StyleSheet } from 'react-native';
import defaultStyles from '../../styles/styles';

export default StyleSheet.create({
  notificationCardUnseen: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    borderBottomColor: '#CCCCCC',
    borderBottomWidth: 1,
    padding: 10,
    backgroundColor: '#fff2f5',
  },
  notificationCardSeen: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    borderBottomColor: '#CCCCCC',
    borderBottomWidth: 1,
    padding: 10,
    backgroundColor: 'white',
  },
  notificationTitleSeen: {
    fontSize: 18,
    textAlign: 'left',
  },
  notificationTitleUnseen: {
    fontSize: 18,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  notificationBodyUnseen: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  notificationBodySeen: {
    fontSize: 15,
  },
  markNotifsSeenButton: {
    position: 'absolute',
    zIndex: 1,
    bottom: 20,
    right: 10,
    ...defaultStyles.primaryColor,
  },
});
