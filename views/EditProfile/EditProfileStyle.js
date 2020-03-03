import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  formElement: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',

    margin: 5,
  },
  inputItem: {
    backgroundColor: 'white',
    marginBottom: 10,
    height: 40,
    width: width * 0.9,
  },
  bioInput: {
    backgroundColor: 'white',
    height: 90,
    width: width * 0.9,
  },
  fieldHeader: {
    textAlign: 'left',
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 18,
    marginTop: 5,
    marginLeft: 5,
  },
  gestureRecognizer: {
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
  },
  icon: {
    marginRight: 20,
    color: 'white',
  },
});
