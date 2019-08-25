import { StyleSheet, Dimensions } from "react-native";
const { height, width } = Dimensions.get('window');

export default (styles = StyleSheet.create({
  view: {
    flexDirection: 'row',
    marginTop: 5,
    alignSelf: "center"
  },
  icon: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  image: {
    marginTop: 5,
    height:20,
    width:20,
  }
}));