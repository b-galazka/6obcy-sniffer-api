export function tryToParseStrToObj(str: string): object | string {
  try {
    const parsedObj = JSON.parse(str.slice(str.indexOf('{'), str.lastIndexOf('}') + 1));

    return typeof parsedObj && parsedObj === 'object' ? parsedObj : str;
  } catch (err) {
    return str;
  }
}
