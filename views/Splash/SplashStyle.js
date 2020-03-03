import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  background: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
