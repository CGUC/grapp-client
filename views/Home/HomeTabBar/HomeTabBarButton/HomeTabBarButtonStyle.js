import { StyleSheet } from 'react-native';
import defaultStyles from '../../../../styles/styles';

export default StyleSheet.create({
  buttonUnselected: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    ...defaultStyles.primaryColor,
  },
  buttonSelected: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    ...defaultStyles.darkenedPrimaryColor,
  },
  text: {
    color: 'white',
  },
  notice: {
    backgroundColor: 'red',
    position: 'absolute',
    marginLeft: -4,
    alignSelf: 'center',
  },
  image: {
    height: 30,
    width: 30,
  },
});
