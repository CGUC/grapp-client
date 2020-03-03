import { StyleSheet, Dimensions, Platform } from 'react-native';
import defaultStyles from '../../styles/styles';

const { height, width } = Dimensions.get('window');

export default StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#00000050',
  },
  headerText: {
    fontSize: 16,
    color: '#FFF',
    paddingRight: 13,
  },
  channelImage: {
    height: 22,
    width: 22,
    tintColor: '#000',
  },
  inputIOS: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#d6d7da',
    borderRadius: 4,
    color: 'black',
    paddingLeft: 50, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    paddingVertical: 8,
    marginLeft: 50, // to ensure the text is never behind the icon
  },
  view: {
    width,
    minHeight: 330,
    maxHeight: height - 220,
    backgroundColor: '#DDDDDD',
  },
  poll: {
    width: width - 10,
    height: height - 350,
  },
  textBox: {
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    paddingTop: 5,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: '#d6d7da',
    marginLeft: 5,
    marginRight: 5,
  },
  buttonGroup: {
    height: 100,
  },
  button: {
    marginTop: 5,
    height: 40,
    marginLeft: 5,
    marginRight: 5,
    ...defaultStyles.primaryColor,
  },
  selectChannelView: {
    margin: 10,
    ...(Platform.OS !== 'ios'
      ? {
          borderWidth: 1,
          borderColor: '#d6d7da',
          borderRadius: 4,
          color: 'black',
        }
      : null),
  },
  postContentView: {
    margin: 5,
  },
  ToolbarView: {
    margin: 5,
  },
  mediaPreviewView: {
    margin: 5,
    marginTop: 0,
  },
});
