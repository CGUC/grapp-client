import { StyleSheet, Dimensions } from "react-native";
const { height, width } = Dimensions.get('window');
import defaultStyles from '../../styles/styles';

export default (styles = StyleSheet.create({
  view: {
    width: '100%',
    paddingLeft: 5,
    paddingRight: 5,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  fillWidth: {
    width: '100%',
  },
  topCheckboxContainer: {
    backgroundColor: '#00000000',
    borderWidth: 0,
    borderColor: '#00000000',
    alignSelf: 'flex-end',
    padding: 0,
    marginTop: 5,
    marginRight: 0,
    marginLeft: 0,
    marginBottom: 0,
  },
  topCheckbox: {
    width: 24,
    height: 24,
  },
  questionText: {
    height: 24,
    marginTop: 5,
    marginLeft: 5,
  },
  textBox: {
    width: '100%',
    height: 80,
    flexWrap: 'wrap',
    marginLeft: 5,
    marginRight: 5,
  },
  optionView: {
    width: '100%',
    flexDirection: 'row',
    marginLeft: 5,
    marginTop: 5,
    alignItems: 'flex-start',
  },
  optionButtonContainer: {
    backgroundColor: '#00000000',
    borderWidth: 0,
    borderColor: '#00000000',
    padding: 0,
    marginLeft: 2,
    marginTop: 2,
    marginBottom: 2,
    marginRight: 8,
  },
  optionButton: {
    width: 24,
    height: 24,
  },
  optionText: {
    flex: 1,
    flexWrap: 'wrap',
    margin: 2,
  },
  optionCount: {
    width: 24,
    height: 24,
    marginLeft: 2,
    marginRight: 5,
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'right',
  },
  optionGroup: {
    width: '100%',
    height: 28,
    marginLeft: 5,
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addContainingView: {
    width: 34,
    height: 28,
    paddingLeft: 5,
    paddingTop: 2,
    paddingBottom: 2,
    paddingRight: 5,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  addView: {
    width: 24,
    height: 24,
    marginLeft: 2,
    marginTop: 2,
    marginBottom: 2,
    marginRight: 8,
    alignSelf: 'center',
  },
  addOptionText: {
    flex: 1,
    height: 20,
    marginTop: 4,
  },
}));
