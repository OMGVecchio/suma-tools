interface SetOptionsObject {
  expirationInMillisecond?: number
  useSession?: boolean
}
type SetOptions = SetOptionsObject | number | boolean

interface GetOptions {
  withOriginal?: boolean
  withExpired?: boolean
}

interface Item {
  value: any
  expiration?: number
  useSession?: string
}

export class ExpiringLocalStorage {
  public setItem(key: string, value: any, options: SetOptions): void {
    const item: Item = {
      value: value,
    };

    this.fillItem(item, options)

    localStorage.setItem(key, JSON.stringify(item));
  }

  public getItem(key: string, options: GetOptions = {}): any {
    const itemStr = localStorage.getItem(key);

    if (!itemStr) {
      return null;
    }

    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiration) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  }

  private fillItem(item: Item, options: SetOptions) {
    switch (typeof options) {
      case 'number':
        item.expiration = this.setTimestamp(options)
        break
      case 'boolean':
        item.useSession = this.setSesion()
        break
      default: {
        if (options.expirationInMillisecond) {
          item.expiration = this.setTimestamp(options.expirationInMillisecond)
        }
        if (options.useSession) {
          item.useSession = this.setSesion()
        }
      }
    }
  }

  private setTimestamp(expirationInMillisecond: number) {
    return new Date().getTime() + expirationInMillisecond
  }

  private setSesion() {
    return ''
  }
}
