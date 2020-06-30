export const toBeSortedBy = (received, { descending = false, key, coerce = false }: IOptions) => {
  const elements = coerce ? coerceValues(received) : received;
  const responseOptions = { received, descending, key };

  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    let nextElement = elements[i + 1];

    if (key && !(key in element)) {
      return buildResponse({ ...responseOptions, pass: false, missingKey: true });
    }

    if (key) {
      element = element[key];
      nextElement = nextElement && nextElement[key];
    }

    if (descending ? element < nextElement : element > nextElement) {
      return buildResponse({ ...responseOptions, pass: false });
    }
  }
  return buildResponse({ ...responseOptions, pass: true });
};

const coerceValues = (values: any[]) => values.map(value => +value);

const missingKeyMessage = (key: string) => `by a missing key, ${key}, `;

const buildResponse = (options: IBuildResponseMessage) => ({
  pass: options.pass,
  message: () => buildResponseMessage(options)
});

const buildResponseMessage = (
  {
    pass,
    descending,
    key,
    keyMessage,
    received,
    missingKey
  }: IBuildResponseMessage
) => {
  let keyMsg = keyMessage ? keyMessage : (key ? `by ${key} ` : "");
  keyMsg = missingKey ? missingKeyMessage(key!) : keyMsg;
  const passMsg = pass ? "not " : "";
  const orderMsg = descending ? "descending" : "ascending";
  const arrayMsg = key ? `Array(${received.length})` : `[${received}]`;
  return `Expected ${arrayMsg} to ${passMsg} be sorted ${keyMsg} in ${orderMsg} order`;
};

interface IBuildResponseMessage {
  key?: string;
  received: any;
  descending: boolean;
  pass: boolean;
  keyMessage?: string;
  missingKey?: boolean;
}

export interface IOptions {
  descending?: boolean;
  key?: string;
  coerce?: boolean;
}
