import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  markAllSeen: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomColor: '#CCCCCC',
    borderBottomWidth: 1,
    marginBottom: 1,
  },
  markAllSeenText: {
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 18,
  },
  settingsIcon: {
    width: 30,
    height: 30,
    marginRight: 15,
    marginBottom: 5,
  },
  profilePicThumbnail: {
    borderWidth: 1,
    marginLeft: 15,
    marginBottom: 5,
    borderColor: '#fff',
  },
});
