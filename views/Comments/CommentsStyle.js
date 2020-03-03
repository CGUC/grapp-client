import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  noDataText: {
    flex: 1,
    flexDirection: 'row',
    fontSize: 18,
    fontStyle: 'italic',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    flex: 0,
    elevation: 0,
    marginTop: 0,
    marginBottom: 0,
    borderColor: 'rgba(0, 0, 0, 0.0)',
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
  },
  cardItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  profilePicThumbnail: {
    borderWidth: 0,
    marginRight: 5,
    marginTop: 5,
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});
