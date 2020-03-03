import { StyleSheet, Dimensions } from 'react-native';
import defaultStyles from '../../styles/styles';

const { height, width } = Dimensions.get('window');

export default StyleSheet.create({
  modal: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000050',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: width * 0.85,
    backgroundColor: 'white',
    borderWidth: 5,
    borderRadius: 5,
    marginTop: 10,
    ...defaultStyles.primaryBorderColor,
  },
  cardFull: {
    height: height * 0.85,
  },
  cardShort: {
    height: 300,
  },
  cancelRow: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginRight: 10,
  },
  cancelIcon: {
    color: '#808080',
    fontSize: 30,
  },
  profilePicture: {
    alignSelf: 'center',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  name: {
    fontWeight: '400',
    fontSize: 26,
    marginTop: 10,
    marginBottom: 15,
  },
  infoBlock: {
    alignSelf: 'flex-start',
    marginLeft: 25,
    marginRight: 25,
    marginTop: 10,
    marginBottom: 10,
  },
  infoText: {
    textAlign: 'left',
  },
  bioBlock: {
    overflow: 'scroll',
    alignSelf: 'flex-start',
    marginLeft: 25,
    marginRight: 25,
    marginTop: 10,
    marginBottom: 10,
  },
});
