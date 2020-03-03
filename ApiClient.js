import { AsyncStorage } from 'react-native';

const config = require('./config');

let servers;
export default class ApiClient {
  static async formatHeaders(options) {
    const contentType = options.contentType
      ? options.contentType
      : 'application/json';
    if (options.authorized) {
      return {
        Accept: 'application/json',
        'Content-Type': contentType,
        Authorization: `Bearer ${await this.getAuthToken()}`,
        ...options.headers,
      };
    }

    return {
      Accept: 'application/json',
      'Content-Type': contentType,
      ...options.headers,
    };
  }

  static async getAuthToken() {
    if (servers !== undefined) return servers[0].token;
    servers = JSON.parse(await AsyncStorage.getItem('@Skybunk:servers'));
    return servers[0].token;
  }

  static async getServerUrl() {
    if (servers !== undefined) return servers[0].url;
    servers = JSON.parse(await AsyncStorage.getItem('@Skybunk:servers'));
    return servers[0].url;
  }

  static async getServers() {
    if (servers !== undefined) return servers;
    servers = JSON.parse(await AsyncStorage.getItem('@Skybunk:servers'));
    return servers;
  }

  static async setServers(_servers) {
    servers = _servers;
    await AsyncStorage.setItem('@Skybunk:servers', JSON.stringify(servers));
  }

  static async clearServers() {
    await AsyncStorage.removeItem('@Skybunk:servers');
    servers = undefined;
  }

  static async get(endpoint, options = {}) {
    const serverUrl = await this.getServerUrl();
    return fetch(`${serverUrl}${endpoint}`, {
      method: 'GET',
      headers: await this.formatHeaders(options),
    })
      .then(response => response.json())
      .then(responseJSON => responseJSON)
      .catch(err => {
        const formattedErr = err.replace(/</g, '').replace(/>/g, '');
        console.error(formattedErr);
      });
  }

  static async post(endpoint, body, options = {}) {
    const serverUrl = await this.getServerUrl();
    return fetch(`${serverUrl}${endpoint}`, {
      method: 'POST',
      headers: await this.formatHeaders(options),
      body: JSON.stringify(body),
    }).catch(err => {
      const formattedErr = err.replace(/</g, '').replace(/>/g, '');
      console.error(formattedErr);
    });
  }

  static async register(newUser, options = {}) {
    if (!newUser.username) return { message: 'Username is required' };
    if (!newUser.password) return { message: 'Password is required' };
    if (!newUser.firstName) return { message: 'First name is required' };
    if (!newUser.lastName) return { message: 'Last name is required' };
    if (!newUser.goldenTicket) return { message: 'golden ticket is required' };

    const authResponse = await fetch(`${config.AUTH_ADDRESS}/users`, {
      method: 'POST',
      headers: await this.formatHeaders(options),
      body: JSON.stringify(newUser),
    });
    const authResponseJson = await authResponse.json();

    if (authResponseJson.servers) {
      this.setServers(authResponseJson.servers);
      return this.post('/users', newUser);
    }
    return { message: authResponseJson };
  }

  static async login(username, password, options = {}) {
    return fetch(`${config.AUTH_ADDRESS}/users/login`, {
      method: 'POST',
      headers: await this.formatHeaders(options),
      body: JSON.stringify({ username, password }),
    });
  }

  static async put(endpoint, body, options = {}) {
    /**
     * HACKFIX (Neil): Sending too many notification objects with requests has
     * returned 413s and crashed the app. Here we're limiting the saved notifications to 30.
     * This logic doesn't belong client-side, but putting it here should neutralize the bug for now.
     */
    const formattedBody = { ...body };
    if (body.notifications) {
      formattedBody.notifications = body.notifications.slice(0, 30);
    }

    const serverUrl = await this.getServerUrl();
    return fetch(`${serverUrl}${endpoint}`, {
      method: 'PUT',
      headers: await this.formatHeaders(options),
      body: JSON.stringify(formattedBody),
    })
      .then(response => response.json())
      .then(responseJSON => responseJSON)
      .catch(err => {
        const formattedErr = err.replace(/</g, '').replace(/>/g, '');
        console.error(formattedErr);
      });
  }

  static async uploadPhoto(endpoint, uri, name, options = {}) {
    const method = options.method ? options.method : 'PUT';

    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    const formData = new FormData();
    formData.append(name, {
      uri,
      name: `${name}.${fileType}`,
      type: `image/${fileType}`,
    });

    const serverUrl = await this.getServerUrl();
    return fetch(`${serverUrl}${endpoint}`, {
      method,
      headers: await this.formatHeaders({
        ...options,
        contentType: 'multipart/form-data',
      }),
      body: formData,
    })
      .then(response => response.json())
      .then(responseJSON => responseJSON)
      .catch(err => {
        const formattedErr = err.replace(/</g, '').replace(/>/g, '');
        console.error(formattedErr);
      });
  }

  static async delete(endpoint, options = {}) {
    const serverUrl = await this.getServerUrl();
    return fetch(`${serverUrl}${endpoint}`, {
      method: 'DELETE',
      headers: await this.formatHeaders(options),
    }).catch(err => {
      const formattedErr = err.replace(/</g, '').replace(/>/g, '');
      console.error(formattedErr);
    });
  }
}
