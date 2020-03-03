import { StyleSheet, Dimensions } from 'react-native';
import defaultStyles from '../../styles/styles';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  profilePicThumbnail: {
    borderWidth: 0,
  },
  card: {
    flex: 1,
    elevation: 0,
    marginTop: 0,
    marginBottom: 4,
  },
  postContent: {
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  postFooter: {
    marginTop: 3,
    marginBottom: 3,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 25,
    height: 25,
    marginRight: 0,
    paddingRight: 0,
  },
  commentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreIconContainer: {
    marginRight: 5,
    marginLeft: 5,
    marginTop: 10,
    marginBottom: 10,
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  headerBody: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 5,
    paddingRight: 5,
  },
  authorDetails: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  headerRight: {
    alignSelf: 'flex-start',
    paddingTop: 6,
  },
  editButtonsContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#00000050',
  },
  view: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: 5,
  },
  editButton: {
    width: width - 10,
    marginTop: 5,
    height: 40,
    marginLeft: 5,
    marginRight: 5,
    ...defaultStyles.primaryColor,
  },
  deleteButton: {
    width: width - 10,
    marginTop: 5,
    height: 40,
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: 'red',
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    borderWidth: 2,
    borderColor: '#AAAAAA',
  },
  footerContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  likesDialog: {
    fontSize: 12,
    paddingLeft: 10,
    flex: 1,
    textAlignVertical: 'center',
  },
  commentsDialog: {
    paddingLeft: 5,
    marginRight: 15,
  },
  likedList: {
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  likedListIcon: {
    width: 25,
    height: 25,
    marginBottom: 10,
    alignSelf: 'center',
  },
  line: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#C0C0C0',
    paddingLeft: 20,
    paddingRight: 20,
  },
  likedListItem: {
    padding: 5,
  },
});
