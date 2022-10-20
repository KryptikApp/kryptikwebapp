export const KRYPTIK_FETCH_ERROR = 'KryptikFetchError';

export interface KryptikFetchRequestOpts extends RequestInit {
  params?: ConstructorParameters<typeof URLSearchParams>[0]; // type of first argument of URLSearchParams constructor.
  timeout?: number;
  dropAbortController?: boolean; // some server requests may not want to use abort controller
}

export interface IKryptikFetchResponse{
  data:any,
  headers:Headers,
  status:number
}

/**
 * KryptikFetch fetches data and handles response edge cases and error handling.
 */
export async function KryptikFetch(
  url: RequestInfo,
  opts: KryptikFetchRequestOpts
):Promise<IKryptikFetchResponse> {
  opts = {
    headers: {},
    method: 'get',
    timeout: 30000, // 30 secs
    ...opts, // Any other fetch options
  };

  if (!url) throw new Error('KryptikFetch: Missing url argument');

  const controller:AbortController|undefined = opts.dropAbortController?undefined:new AbortController();
  if(controller){
    const id = setTimeout(() => controller.abort(), opts.timeout);
    clearTimeout(id);
  }
 
  const { body, params, headers, ...otherOpts } = opts;

  const requestBody =
    body && typeof body === 'object' ? JSON.stringify(opts.body) : opts.body;

  const response = await fetch(`${url}${createParams(params)}`, {
    ...otherOpts,
    body: requestBody,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    signal: controller?controller.signal:null
  });
  

  const responseBody = await getBody(response);

  if (response.ok) {
    const { headers, status } = response;
    return { data: responseBody, headers, status };
  } else {
    const errorResponseBody =
      typeof responseBody === 'string' ? { error: responseBody } : responseBody;

    const error = generateError({
      requestBody: body,
      response,
      responseBody: errorResponseBody,
    });

    throw error;
  }
}

function getBody(response: Response) {
  const contentType = response.headers.get('Content-Type');
  if (contentType?.startsWith('application/json')) {
    return response.json();
  } else {
    return response.text();
  }
}

function createParams(params: KryptikFetchRequestOpts['params']) {
  return params ? `?${new URLSearchParams(params)}` : '';
}

interface KryptikFetchError extends Error {
  response?: Response;
  responseBody?: any;
  requestBody?: RequestInit['body'];
}

function generateError({
  requestBody,
  response,
  responseBody,
}: {
  requestBody: RequestInit['body'];
  response: Response;
  responseBody: any;
}) {
  const message =
    responseBody?.error ||
    response?.statusText ||
    'There was an error with the request.';

  const error: KryptikFetchError = new Error(message);

  error.response = response;
  error.responseBody = responseBody;
  error.requestBody = requestBody;

  return error;
}

interface KryptikFetchClientOpts extends KryptikFetchRequestOpts {
  baseURL?: string;
}

export class KryptikFetchClient {
  baseURL: string;
  opts: KryptikFetchRequestOpts;

  constructor(opts: KryptikFetchClientOpts = {}) {
    const { baseURL = '', ...otherOpts } = opts;
    this.baseURL = baseURL;
    this.opts = otherOpts;
  }

  /**
   * Perform a GET request with the KryptikFetchClient.
   */
  get(url?: RequestInfo, opts?: KryptikFetchRequestOpts) {
    return KryptikFetch(`${this.baseURL}${url}`, {
      ...opts,
      method: 'get',
    });
  }

  /**
   * Perform a DELETE request with the KryptikFetchClient.
   */
  delete(url?: RequestInfo, opts?: KryptikFetchRequestOpts) {
    return KryptikFetch(`${this.baseURL}${url}`, {
      ...opts,
      method: 'delete',
    });
  }

  /**
   * Perform a HEAD request with the KryptikFetchClient.
   */
  head(url?: RequestInfo, opts?: KryptikFetchRequestOpts) {
    return KryptikFetch(`${this.baseURL}${url}`, {
      ...opts,
      method: 'head',
    });
  }

  /**
   * Perform a OPTIONS request with the KryptikFetchClient.
   */
  options(url?: RequestInfo, opts?: KryptikFetchRequestOpts) {
    return KryptikFetch(`${this.baseURL}${url}`, {
      ...opts,
      method: 'options',
    });
  }

  /**
   * Perform a POST request with the KryptikFetchClient.
   */
  post(url?: RequestInfo, body?: any, opts?: KryptikFetchRequestOpts) {
    return KryptikFetch(`${this.baseURL}${url}`, {
      ...opts,
      body,
      method: 'post',
    });
  }

  /**
   * Perform a PUT request with the KryptikFetchClient.
   */
  put(url?: RequestInfo, body?: any, opts?: KryptikFetchRequestOpts) {
    return KryptikFetch(`${this.baseURL}${url}`, {
      ...opts,
      body,
      method: 'put',
    });
  }

  /**
   * Perform a PATCH request with the KryptikFetchClient.
   */
  patch(url?: RequestInfo, body?: any, opts?: KryptikFetchRequestOpts) {
    return KryptikFetch(`${this.baseURL}${url}`, {
      ...opts,
      body,
      method: 'patch',
    });
  }
}