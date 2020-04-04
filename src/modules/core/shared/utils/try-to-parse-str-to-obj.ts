import { isObject } from './is-object';

export function tryToParseStrToObj(str: string): object | string {
  try {
    const parsedValue = JSON.parse(str.slice(str.indexOf('{'), str.lastIndexOf('}') + 1));

    return isObject(parsedValue) ? parsedValue : str;
  } catch (err) {
    return str;
  }
}
