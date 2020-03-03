import { StyleSheet, Dimensions } from 'react-native';
import defaultStyles from '../../styles/styles';

export default StyleSheet.create({
  background: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loginLogo: {
    width: 300,
    height: 200,
    marginTop: 20,
    marginBottom: 20,
  },
  loginInputGroup: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  loginButtonsGroup: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  loginButton: {
    width: 300,
    ...defaultStyles.primaryColor,
  },
  loginTitle: {
    fontSize: 30,
    color: 'white',
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
  inputItem: {
    backgroundColor: 'white',
    marginBottom: 10,
    width: 300,
  },
});
