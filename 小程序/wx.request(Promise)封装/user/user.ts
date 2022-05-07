import { http } from '../http';

export class User {
  static getUserInfo(url: string) {
    return http({ url, method: 'POST' })
  }
}