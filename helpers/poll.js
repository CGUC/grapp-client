import ApiClient from '../ApiClient';

export function getPoll(postID) {
  return new Promise((resolve, reject) => {
    ApiClient.get(`/posts/${postID}/poll`, { authorized: true })
      .then(poll => {
        resolve(poll);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function createPoll(postID, data) {
  return new Promise((resolve, reject) => {
    ApiClient.post(`/posts/${postID}/poll`, data, { authorized: true })
      .then(response => {
        if (!response.ok) {
          response.json().then(error => {
            reject(error);
          });
        } else {
          response.json().then(poll => {
            resolve(poll);
          });
        }
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function removePoll(postID) {
  return new Promise((resolve, reject) => {
    ApiClient.delete(`/posts/${postID}/poll`, { authorized: true })
      .then(response => {
        if (!response.ok) {
          response.json().then(error => {
            reject(error);
          });
        } else {
          response.json().then(poll => {
            resolve(poll);
          });
        }
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function pollOption(postID, option) {
  return new Promise((resolve, reject) => {
    ApiClient.post(`/posts/${postID}/poll/option`, option, { authorized: true })
      .then(response => {
        if (!response.ok) {
          response.json().then(error => {
            reject(error);
          });
        } else {
          response.json().then(poll => {
            resolve(poll);
          });
        }
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function pollDeleteOption(postID, option) {
  return new Promise((resolve, reject) => {
    ApiClient.post(`/posts/${postID}/poll/option/delete`, option, {
      authorized: true,
    })
      .then(response => {
        if (!response.ok) {
          response.json().then(error => {
            reject(error);
          });
        } else {
          response.json().then(poll => {
            resolve(poll);
          });
        }
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function pollVote(postID, data) {
  return new Promise((resolve, reject) => {
    ApiClient.post(`/posts/${postID}/poll/vote`, data, { authorized: true })
      .then(response => {
        if (!response.ok) {
          response.json().then(error => {
            reject(error);
          });
        } else {
          response.json().then(poll => {
            resolve(poll);
          });
        }
      })
      .catch(error => {
        reject(error);
      });
  });
}
