import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as HttpAgent from 'node:http';
import * as HttpsAgent from 'node:https';

export type HttpHeaders = Record<string, string>;

interface RequestOptions<T> {
  method: string;
  url: string;
  headers: HttpHeaders;
  json?: T;
  body?: string;
}


@Injectable()
export class HttpClientService {
  private _headers: HttpHeaders = {};

  public set headers(headers: HttpHeaders) {
    this._headers = headers;
  }

  public get headers() {
    return this._headers;
  }

  async get<T>(url: string, headers?: HttpHeaders): Promise<T> {
    return this.#send<T>('GET', url, headers);
  }

  async post<T, P extends object = {}>(url: string, payload?: P, headers?: HttpHeaders): Promise<T> {
    return this.#send<T, P>('POST', url, headers, payload);
  }

  async put<T, P extends object = {}>(url: string, payload?: P, headers?: HttpHeaders): Promise<T> {
    return this.#send<T, P>('PUT', url, headers, payload);
  }

  async patch<T, P extends object = {}>(url: string, payload?: P, headers?: HttpHeaders): Promise<T> {
    return this.#send<T, P>('PATCH', url, headers, payload);
  }

  async delete<T>(url: string, headers?: HttpHeaders): Promise<T> {
    return this.#send<T>('DELETE', url, headers);
  }

  async #send<T, P extends object = {}>(method: string, url: string, headers?: HttpHeaders, payload?: P): Promise<T> {
    headers = headers || {};
    const json = typeof payload === 'object' ? payload : undefined;
    const body = typeof payload === 'object' ? undefined : payload;

    const reqOptions: RequestOptions<P> = {
      method,
      url: url,
      headers: { ...this._headers, ...headers },
      json,
      body,
    };

    return new Promise<T>((resolve, reject) => {
      this.#request(reqOptions, (err, res, result) => {
        if (err) {
          return reject(new HttpException(err.message || err, err.status || HttpStatus.INTERNAL_SERVER_ERROR));
        }
        resolve(result);
      });
    });
  }

  #request<T>(options: RequestOptions<T>, callback: (err: any, res: any, result: any) => void): void {
    const url = new URL(options.url);
    const urlPort = parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80);
    const request = urlPort === 443 ? HttpsAgent.request : HttpAgent.request;

    const reqOptions: HttpAgent.RequestOptions = {
      hostname: url.hostname,
      protocol: url.protocol,
      port: urlPort,
      path: url.pathname + url.search,
      method: options.method,
      headers: {
        Origin: url.origin,
        Referer: `${url.origin}/`,
        ...options.headers,
      },
    };

    const req = request(reqOptions, (res) => {
      const data: Uint8Array[] = [];

      res.on('data', (chunk) => {
        data.push(chunk);
      });

      res.on('end', () => {
        let payload: any = Buffer.concat(data);

        if (res.headers['content-type']?.startsWith('application/json')) {
          try {
            payload = JSON.parse(payload.toString());
          } catch (err) {
            return callback(err, res, null);
          }
        }

        if (res.statusCode !== 200) {
          return callback({
            method: reqOptions.method,
            path: reqOptions.path,
            status: res.statusCode,
            message: res.statusMessage,
          }, res, payload);
        }

        callback(null, res, payload);
      });
    });

    req.on('error', (error) => {
      callback({ method: reqOptions.method, path: reqOptions.path, error }, null, null);
    });

    if (options.json || options.body) {
      req.write(options.json ? JSON.stringify(options.json) : options.body);
    }

    req.end();
  }
}
