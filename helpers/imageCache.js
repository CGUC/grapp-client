import { Cache } from 'react-native-cache';
import { AsyncStorage, MemoryStore, Platform } from 'react-native';
import date from 'date-fns';
import ApiClient from '../ApiClient';

const disableCache = false; // debugging tool to debug the cache. Should be false in production

let backend;
if (Platform.OS === 'android') backend = MemoryStore;
else backend = AsyncStorage;

const profilePicCache = new Cache({
  namespace: 'skybunk-profile-pictures',
  policy: {
    maxEntries: 30,
  },
  backend,
});

const postPicCache = new Cache({
  namespace: 'skybunk-post-pictures',
  policy: {
    maxEntries: 15,
  },
  backend,
});

export function getProfilePicture(userID) {
  return new Promise((resolve, reject) => {
    // Try to get the item from the cache
    profilePicCache.getItem(userID, (getCacheErr, cachedPic) => {
      if (getCacheErr) {
        reject(getCacheErr);
      } else if (
        disableCache ||
        !cachedPic ||
        !cachedPic.image ||
        date.differenceInHours(new Date(), cachedPic.timeFetched) > 24
      ) {
        // cache miss, or over 24 hours old, so go fetch a new copy
        ApiClient.get(`/users/${userID}/profilePicture`, { authorized: true })
          .then(pic => {
            // save fetched item to cache
            profilePicCache.setItem(
              userID,
              { timeFetched: new Date(), image: pic },
              setCacheErr => {
                if (setCacheErr) {
                  reject(setCacheErr);
                } else {
                  resolve(pic);
                }
              },
            );
          })
          .catch(error => {
            reject(error);
          });
      } else {
        // cache hit, so just return the picture
        resolve(cachedPic.image);
      }
    });
  });
}

export function setProfilePicture(userID, pictureURI) {
  return new Promise((resolve, reject) => {
    ApiClient.uploadPhoto(
      `/users/${userID}/profilePicture`,
      pictureURI,
      'profilePicture',
      {
        authorized: true,
      },
    )
      .then(pic => {
        profilePicCache.setItem(
          userID,
          { timeFetched: new Date(), image: pic },
          err => {
            if (err) {
              reject(err);
            } else {
              resolve(pic);
            }
          },
        );
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getPostPicture(postID) {
  return new Promise((resolve, reject) => {
    // Try to get the item from the cache
    postPicCache.getItem(postID, (err, cachedPic) => {
      if (err) {
        reject(err);
      } else if (
        disableCache ||
        !cachedPic ||
        !cachedPic.image ||
        date.differenceInHours(new Date(), cachedPic.timeFetched) > 24
      ) {
        // cache miss, or over 24 hours old, so go fetch a new copy
        ApiClient.get(`/posts/${postID}/image`, { authorized: true })
          .then(pic => {
            // save fetched item to cache
            postPicCache.setItem(
              postID,
              { timeFetched: new Date(), image: pic },
              setCacheErr => {
                if (setCacheErr) {
                  reject(setCacheErr);
                } else {
                  resolve(pic);
                }
              },
            );
          })
          .catch(error => {
            reject(error);
          });
      } else {
        // cache hit, so just return the picture
        resolve(cachedPic.image);
      }
    });
  });
}

export function setPostPicture(postID, pictureURI) {
  return new Promise((resolve, reject) => {
    ApiClient.uploadPhoto(`/posts/${postID}/image`, pictureURI, 'image', {
      authorized: true,
      method: 'POST',
    })
      .then(pic => {
        postPicCache.setItem(
          postID,
          { timeFetched: new Date(), image: pic },
          err => {
            if (err) {
              reject(err);
            } else {
              resolve(pic);
            }
          },
        );
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function deletePostPicture(postID) {
  return new Promise((resolve, reject) => {
    ApiClient.delete(`/posts/${postID}/image`, { authorized: true })
      .then(() => {
        postPicCache.removeItem(postID, () => {
          resolve();
        });
      })
      .catch(err => {
        console.error(err);
        reject(err);
      });
  });
}

export function clearCache() {
  return new Promise((resolve, reject) => {
    profilePicCache.clearAll(err => {
      if (err) {
        reject(err);
      } else {
        postPicCache.clearAll(err2 => {
          if (err2) reject(err2);
          resolve();
        });
      }
    });
  });
}
