/*
 * RealObjects PDFreactor Node.js Client version 10
 * https://www.pdfreactor.com
 *
 * Released under the following license:
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2015-2022 RealObjects GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
//eslint-disable-next-line @typescript-eslint/no-var-requires
const url = require('url');
//eslint-disable-next-line @typescript-eslint/no-var-requires
const stream = require('stream');
class PDFreactor {
  _serviceUrl: any;
  _http: any;
  static VERSION: any;
  _apiKey: any;
  static AsyncUnavailableError: any;
  static BadRequestError: any;
  static CommandRejectedError: any;
  static ConversionAbortedError: any;
  static ConversionFailureError: any;
  static DocumentNotFoundError: any;
  static ResourceNotFoundError: any;
  static InvalidClientError: any;
  static InvalidConfigurationError: any;
  static NoConfigurationError: any;
  static NoInputDocumentError: any;
  static RequestRejectedError: any;
  static ServiceUnavailableError: any;
  static UnauthorizedError: any;
  static UnprocessableConfigurationError: any;
  static UnprocessableInputError: any;
  static NotAcceptableError: any;
  static ServerError: any;
  static PDFreactorWebserviceError: (data: any) => void;
  static message: any;
  static event: any;
  static ClientError: (data: any) => void;
  static errorId: any;
  static result: any;
  static UnreachableServiceError: (data: any) => void;
  static InvalidServiceError: (data: any) => void;
  static CallbackType(
    CallbackType: any,
    arg1: string,
    arg2: { value: string }
  ) {
    throw new Error('Method not implemented.');
  }
  static Cleanup(Cleanup: any, arg1: string, arg2: { value: string }) {
    throw new Error('Method not implemented.');
  }
  static ColorSpace(ColorSpace: any, arg1: string, arg2: { value: string }) {
    throw new Error('Method not implemented.');
  }
  static Conformance(Conformance: any, arg1: string, arg2: { value: string }) {
    throw new Error('Method not implemented.');
  }
  static ContentType(ContentType: any, arg1: string, arg2: { value: string }) {
    throw new Error('Method not implemented.');
  }
  static CssPropertySupport(
    CssPropertySupport: any,
    arg1: string,
    arg2: { value: string }
  ) {
    throw new Error('Method not implemented.');
  }
  static Doctype(Doctype: any, arg1: string, arg2: { value: string }) {
    throw new Error('Method not implemented.');
  }
  static Encryption(Encryption: any, arg1: string, arg2: { value: string }) {
    throw new Error('Method not implemented.');
  }
  static ErrorPolicy(ErrorPolicy: any, arg1: string, arg2: { value: string }) {
    throw new Error('Method not implemented.');
  }
  static ExceedingContentAgainst(
    ExceedingContentAgainst: any,
    arg1: string,
    arg2: { value: string }
  ) {
    throw new Error('Method not implemented.');
  }
  static ExceedingContentAnalyze(
    ExceedingContentAnalyze: any,
    arg1: string,
    arg2: { value: string }
  ) {
    throw new Error('Method not implemented.');
  }
  static HttpsMode(HttpsMode: any, arg1: string, arg2: { value: string }) {
    throw new Error('Method not implemented.');
  }
  static JavaScriptDebugMode(
    JavaScriptDebugMode: any,
    arg1: string,
    arg2: { value: string }
  ) {
    throw new Error('Method not implemented.');
  }
  static JavaScriptMode(
    JavaScriptMode: any,
    arg1: string,
    arg2: { value: string }
  ) {
    throw new Error('Method not implemented.');
  }
  static KeystoreType(
    KeystoreType: any,
    arg1: string,
    arg2: { value: string }
  ) {
    throw new Error('Method not implemented.');
  }
  static LogLevel(LogLevel: any, arg1: string, arg2: { value: string }) {
    throw new Error('Method not implemented.');
  }
  static MediaFeature(
    MediaFeature: any,
    arg1: string,
    arg2: { value: string }
  ) {
    throw new Error('Method not implemented.');
  }
  static MergeMode(MergeMode: any, arg1: string, arg2: { value: string }) {
    throw new Error('Method not implemented.');
  }
  static OutputIntentDefaultProfile(
    OutputIntentDefaultProfile: any,
    arg1: string,
    arg2: { value: string }
  ) {
    throw new Error('Method not implemented.');
  }
  static OutputType(OutputType: any, arg1: string, arg2: { value: string }) {
    throw new Error('Method not implemented.');
  }
  static OverlayRepeat(
    OverlayRepeat: any,
    arg1: string,
    arg2: { value: string }
  ) {
    throw new Error('Method not implemented.');
  }
  static PageOrder(PageOrder: any, arg1: string, arg2: { value: string }) {
    throw new Error('Method not implemented.');
  }
  static PagesPerSheetDirection(
    PagesPerSheetDirection: any,
    arg1: string,
    arg2: { value: string }
  ) {
    throw new Error('Method not implemented.');
  }
  static PdfScriptTriggerEvent(
    PdfScriptTriggerEvent: any,
    arg1: string,
    arg2: { value: string }
  ) {
    throw new Error('Method not implemented.');
  }
  static ProcessingPreferences(
    ProcessingPreferences: any,
    arg1: string,
    arg2: { value: string }
  ) {
    throw new Error('Method not implemented.');
  }
  static QuirksMode(QuirksMode: any, arg1: string, arg2: { value: string }) {
    throw new Error('Method not implemented.');
  }
  static ResolutionUnit(
    ResolutionUnit: any,
    arg1: string,
    arg2: { value: string }
  ) {
    throw new Error('Method not implemented.');
  }
  static ResourceType(
    ResourceType: any,
    arg1: string,
    arg2: { value: string }
  ) {
    throw new Error('Method not implemented.');
  }
  static SigningMode(SigningMode: any, arg1: string, arg2: { value: string }) {
    throw new Error('Method not implemented.');
  }
  static ViewerPreferences(
    ViewerPreferences: any,
    arg1: string,
    arg2: { value: string }
  ) {
    throw new Error('Method not implemented.');
  }
  static XmpPriority(XmpPriority: any, arg1: string, arg2: { value: string }) {
    throw new Error('Method not implemented.');
  }
  constructor(serviceUrl?: string) {
    this._serviceUrl = serviceUrl || 'http://localhost:9423/service/rest';
    if (this._serviceUrl.substr(-1) === '/') {
      this._serviceUrl = this._serviceUrl.substr(
        0,
        this._serviceUrl.length - 1
      );
    }
    if (url.parse(this._serviceUrl).protocol === 'https:') {
      this._http = require('https');
    } else {
      this._http = require('http');
    }
  }
  convert(configuration: any, connectionSettings?: any) {
    return new Promise((resolve, reject) => {
      let restUrl = this._serviceUrl + '/convert.json';
      if (this.apiKey) {
        restUrl += '?apiKey=' + this.apiKey;
      }
      const options = url.parse(restUrl);
      if (configuration) {
        configuration.clientName = 'NODEJS';
        configuration.clientVersion = PDFreactor.VERSION;
      }
      options.headers = {};
      if (connectionSettings && connectionSettings.headers) {
        for (const key in connectionSettings.headers) {
          const lcKey = key.toLowerCase();
          if (
            lcKey !== 'user-agent' &&
            lcKey !== 'content-type' &&
            lcKey !== 'range'
          ) {
            options.headers[key] = connectionSettings.headers[key];
          }
        }
      }
      options.headers.cookie = '';
      options.headers['Content-Type'] = 'application/json';
      options.headers['User-Agent'] = 'PDFreactor Node.js API v10';
      options.headers['X-RO-User-Agent'] = 'PDFreactor Node.js API v10';
      options.method = 'post';
      if (connectionSettings && connectionSettings.cookies) {
        //eslint-disable-next-line no-prototype-builtins
        for (const name in connectionSettings.cookies) {
          //eslint-disable-next-line no-prototype-builtins
          if (connectionSettings.cookies.hasOwnProperty(name)) {
            options.headers.cookie +=
              name + '=' + connectionSettings.cookies[name] + '; ';
          }
        }
      }
      let errorMode = true;
      let responseText = '';
      let result = null;
      const req = this._http.request(options, (res: any) => {
        res.setEncoding('utf8');
        res.on('data', (chunk: any) => {
          responseText += chunk;
        });
        res.on('end', (e: any) => {
          if (res.statusCode >= 200 && res.statusCode <= 204) {
            errorMode = false;
          }
          if (!errorMode) {
            return resolve(this._parseJson(responseText));
          } else {
            result = this._parseJson(responseText);
            const errorId = res.headers['X-RO-Error-ID'];
            let err;
            if (res.statusCode == 422) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: result.error,
                result: result,
              });
            } else if (res.statusCode == 400) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'Invalid client data. ' + result.error,
                result: undefined,
              });
            } else if (res.statusCode == 401) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'Unauthorized. ' + result.error,
                result: undefined,
              });
            } else if (res.statusCode == 413) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'The configuration is too large to process.',
                result: result,
              });
            } else if (res.statusCode == 500) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: result.error,
                result: result,
              });
            
            } else if (res.statusCode == 503) { 
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'PDFreactor Web Service is unavailable.',
                result: result,
              });
            } else {
              err = {
                message:
                  'PDFreactor Web Service error (status: ' +
                  res.statusCode +
                  ').',
              };
            }
            return reject(err);
          }
        });
      });
      req.on('error', (e: any) => {
        return reject({
          message:
            'Error connecting to PDFreactor Web Service at ' +
            this._serviceUrl +
            '. Please make sure the PDFreactor Web Service is installed and running (' +
            e +
            ')',
          event: e,
        });
      });
      req.write(JSON.stringify(configuration));
      req.end();
    });
  }
  static _createServerError(arg0: {
    errorId: any;
    event: any;
    message: any;
    result: any;
  }): any {
    throw new Error('Method not implemented.');
  }
  convertAsBinary(
    configuration: any,
    writeStream: any,
    connectionSettings?: any
  ) {
    if (
      !(writeStream instanceof stream && typeof writeStream.write == 'function')
    ) {
      connectionSettings = writeStream;
      writeStream = undefined;
    }
    return new Promise<void | string>((resolve, reject) => {
      let restUrl = this._serviceUrl + '/convert.bin';
      if (this.apiKey) {
        restUrl += '?apiKey=' + this.apiKey;
      }
      const options = url.parse(restUrl);
      if (configuration) {
        configuration.clientName = 'NODEJS';
        configuration.clientVersion = PDFreactor.VERSION;
      }
      options.headers = {};
      if (connectionSettings && connectionSettings.headers) {
        for (const key in connectionSettings.headers) {
          const lcKey = key.toLowerCase();
          if (
            lcKey !== 'user-agent' &&
            lcKey !== 'content-type' &&
            lcKey !== 'range'
          ) {
            options.headers[key] = connectionSettings.headers[key];
          }
        }
      }
      options.headers.cookie = '';
      options.headers['Content-Type'] = 'application/json';
      options.headers['User-Agent'] = 'PDFreactor Node.js API v10';
      options.headers['X-RO-User-Agent'] = 'PDFreactor Node.js API v10';
      options.method = 'post';
      if (connectionSettings && connectionSettings.cookies) {
        for (const name in connectionSettings.cookies) {
          //eslint-disable-next-line no-prototype-builtins
          if (connectionSettings.cookies.hasOwnProperty(name)) {
            options.headers.cookie +=
              name + '=' + connectionSettings.cookies[name] + '; ';
          }
        }
      }
      let errorMode = true;
      let responseText = '';
      const req = this._http.request(options, (res: any) => {
        res.setEncoding('binary');
        res.once('data', () => {
          if (res.statusCode >= 200 && res.statusCode <= 204) {
            errorMode = false;
          }
        });
        res.on('data', (chunk: any) => {
          if (errorMode || !writeStream) {
            responseText += chunk;
          } else if (writeStream) {
            writeStream.write(chunk, 'binary');
          }
        });
        res.on('end', (e: any) => {
          if (writeStream) {
            writeStream.end();
            if (!errorMode) {
              return resolve();
            }
          }
          if (!errorMode) {
            return resolve(responseText);
          } else {
            const errorId = res.headers['X-RO-Error-ID'];
            let err;
            if (res.statusCode == 422) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: responseText,
                result: undefined,
              });
            } else if (res.statusCode == 400) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'Invalid client data. ' + responseText,
                result: undefined,
              });
            } else if (res.statusCode == 401) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'Unauthorized. ' + responseText,
                result: undefined,
              });
            } else if (res.statusCode == 413) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'The configuration is too large to process.',
                result: undefined,
              });
            } else if (res.statusCode == 500) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: responseText,
                result: undefined,
              });
            
            } else if (res.statusCode == 503) { 
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'PDFreactor Web Service is unavailable.',
                result: undefined,
              });
            } else {
              err = {
                message:
                  'PDFreactor Web Service error (status: ' +
                  res.statusCode +
                  ').',
              };
            }
            return reject(err);
          }
        });
      });
      req.on('error', (e: any) => {
        return reject({
          message:
            'Error connecting to PDFreactor Web Service at ' +
            this._serviceUrl +
            '. Please make sure the PDFreactor Web Service is installed and running (' +
            e +
            ')',
          event: e,
        });
      });
      req.write(JSON.stringify(configuration));
      req.end();
    });
  }
  
  convertAsync(configuration: any, connectionSettings?: any) {
    return new Promise((resolve, reject) => {
      let documentId: string;
      let restUrl = this._serviceUrl + '/convert/async.json';
      if (this.apiKey) {
        restUrl += '?apiKey=' + this.apiKey;
      }
      const options = url.parse(restUrl);
      if (configuration) {
        configuration.clientName = 'NODEJS';
        configuration.clientVersion = PDFreactor.VERSION;
      }
      options.headers = {};
      if (connectionSettings && connectionSettings.headers) {
        for (const key in connectionSettings.headers) {
          const lcKey = key.toLowerCase();
          if (
            lcKey !== 'user-agent' &&
            lcKey !== 'content-type' &&
            lcKey !== 'range'
          ) {
            options.headers[key] = connectionSettings.headers[key];
          }
        }
      }
      options.headers.cookie = '';
      options.headers['Content-Type'] = 'application/json';
      options.headers['User-Agent'] = 'PDFreactor Node.js API v10';
      options.headers['X-RO-User-Agent'] = 'PDFreactor Node.js API v10';
      options.method = 'post';
      if (connectionSettings && connectionSettings.cookies) {
        //eslint-disable-next-line no-prototype-builtins
        for (const name in connectionSettings.cookies) {
          //eslint-disable-next-line no-prototype-builtins
          if (connectionSettings.cookies.hasOwnProperty(name)) {
            options.headers.cookie +=
              name + '=' + connectionSettings.cookies[name] + '; ';
          }
        }
      }
      let errorMode = true;
      let responseText = '';
      let result = null;
      
      const req = this._http.request(options, (res: any) => {
        res.setEncoding('utf8');
        res.on('data', (chunk: any) => {
          responseText += chunk;
        });
        res.on('end', (e: any) => {
          if (res.statusCode >= 200 && res.statusCode <= 204) {
            errorMode = false;
          }
          const progressUrl = res.headers['location'];
          if (progressUrl) {
            documentId = progressUrl.substring(
              progressUrl.lastIndexOf('/') + 1
            );
            const cookieHeader = res.headers['set-cookie'];
            if (cookieHeader && connectionSettings) {
              if (!connectionSettings.cookies) {
                connectionSettings.cookies = {};
              }
              cookieHeader.forEach((item: any) => {
                const name = item.substring(0, item.indexOf('='));
                const value = item.substring(
                  item.indexOf('=') + 1,
                  item.indexOf(';')
                );
                connectionSettings.cookies[name] = value;
              });
            }
          }
          if (!errorMode) {
            return resolve(documentId);
          } else {
            result = this._parseJson(responseText);
            const errorId = res.headers['X-RO-Error-ID'];
            let err;
            if (res.statusCode == 422) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: result.error,
                result: result,
              });
            } else if (res.statusCode == 400) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'Invalid client data. ' + result.error,
                result: undefined,
              });
            } else if (res.statusCode == 401) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'Unauthorized. ' + result.error,
                result: undefined,
              });
            } else if (res.statusCode == 413) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'The configuration is too large to process.',
                result: result,
              });
            } else if (res.statusCode == 500) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: result.error,
                result: result,
              });
            
            } else if (res.statusCode == 503) { 
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'Asynchronous conversions are unavailable.',
                result: result,
              });
            } else {
              err = {
                message:
                  'PDFreactor Web Service error (status: ' +
                  res.statusCode +
                  ').',
              };
            }
            return reject(err);
          }
        });
      });
      req.on('error', (e: any) => {
        return reject({
          message:
            'Error connecting to PDFreactor Web Service at ' +
            this._serviceUrl +
            '. Please make sure the PDFreactor Web Service is installed and running (' +
            e +
            ')',
          event: e,
        });
      });
      req.write(JSON.stringify(configuration));
      req.end();
    });
  }
  getProgress(documentId: string, connectionSettings?: any) {
    return new Promise((resolve, reject) => {
      let restUrl = this._serviceUrl + '/progress/' + documentId + '.json';
      if (this.apiKey) {
        restUrl += '?apiKey=' + this.apiKey;
      }
      const options = url.parse(restUrl);
      options.headers = {};
      if (connectionSettings && connectionSettings.headers) {
        for (const key in connectionSettings.headers) {
          const lcKey = key.toLowerCase();
          if (
            lcKey !== 'user-agent' &&
            lcKey !== 'content-type' &&
            lcKey !== 'range'
          ) {
            options.headers[key] = connectionSettings.headers[key];
          }
        }
      }
      options.headers.cookie = '';
      options.headers['Content-Type'] = 'application/json';
      options.headers['User-Agent'] = 'PDFreactor Node.js API v10';
      options.headers['X-RO-User-Agent'] = 'PDFreactor Node.js API v10';
      options.method = 'get';
      //eslint-disable-next-line no-prototype-builtins
      if (connectionSettings && connectionSettings.cookies) {
        for (const name in connectionSettings.cookies) {
          //eslint-disable-next-line no-prototype-builtins
          if (connectionSettings.cookies.hasOwnProperty(name)) {
            options.headers.cookie +=
              name + '=' + connectionSettings.cookies[name] + '; ';
          }
        }
      }
      let errorMode = true;
      let responseText = '';
      let result = null;
      const req = this._http.request(options, (res: any) => {
        res.setEncoding('utf8');
        res.on('data', (chunk: any) => {
          responseText += chunk;
        });
        res.on('end', (e: any) => {
          if (res.statusCode >= 200 && res.statusCode <= 204) {
            errorMode = false;
          }
          if (!errorMode) {
            return resolve(this._parseJson(responseText));
          } else {
            result = this._parseJson(responseText);
            const errorId = res.headers['X-RO-Error-ID'];
            let err;
            if (res.statusCode == 422) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: result.error,
                result: result,
              });
            } else if (res.statusCode == 404) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message:
                  'Document with the given ID was not found. ' + result.error,
                result: undefined,
              });
            } else if (res.statusCode == 401) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'Unauthorized. ' + result.error,
                result: undefined,
              });
            } else if (res.statusCode == 503) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'PDFreactor Web Service is unavailable.',
                result: result,
              });
            } else {
              err = {
                message:
                  'PDFreactor Web Service error (status: ' +
                  res.statusCode +
                  ').',
              };
            }
            return reject(err);
          }
        });
      });
      req.on('error', (e: any) => {
        return reject({
          message:
            'Error connecting to PDFreactor Web Service at ' +
            this._serviceUrl +
            '. Please make sure the PDFreactor Web Service is installed and running (' +
            e +
            ')',
          event: e,
        });
      });
      req.end();
    });
  }
  getDocument(documentId: string, connectionSettings?: any) {
    return new Promise((resolve, reject) => {
      let restUrl = this._serviceUrl + '/document/' + documentId + '.json';
      if (this.apiKey) {
        restUrl += '?apiKey=' + this.apiKey;
      }
      const options = url.parse(restUrl);
      options.headers = {};
      if (connectionSettings && connectionSettings.headers) {
        for (const key in connectionSettings.headers) {
          const lcKey = key.toLowerCase();
          if (
            lcKey !== 'user-agent' &&
            lcKey !== 'content-type' &&
            lcKey !== 'range'
          ) {
            options.headers[key] = connectionSettings.headers[key];
          }
        }
      }
      options.headers.cookie = '';
      options.headers['Content-Type'] = 'application/json';
      options.headers['User-Agent'] = 'PDFreactor Node.js API v10';
      options.headers['X-RO-User-Agent'] = 'PDFreactor Node.js API v10';
      //eslint-disable-next-line no-prototype-builtins
      options.method = 'get';
      if (connectionSettings && connectionSettings.cookies) {
        for (const name in connectionSettings.cookies) {
          //eslint-disable-next-line no-prototype-builtins
          if (connectionSettings.cookies.hasOwnProperty(name)) {
            options.headers.cookie +=
              name + '=' + connectionSettings.cookies[name] + '; ';
          }
        }
      }
      let errorMode = true;
      let responseText = '';
      let result = null;
      const req = this._http.request(options, (res: any) => {
        res.setEncoding('utf8');
        res.on('data', (chunk: any) => {
          responseText += chunk;
        });
        res.on('end', (e: any) => {
          if (res.statusCode >= 200 && res.statusCode <= 204) {
            errorMode = false;
          }
          if (!errorMode) {
            return resolve(this._parseJson(responseText));
          } else {
            result = this._parseJson(responseText);
            const errorId = res.headers['X-RO-Error-ID'];
            let err;
            if (res.statusCode == 422) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: result.error,
                result: result,
              });
            } else if (res.statusCode == 404) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message:
                  'Document with the given ID was not found. ' + result.error,
                result: undefined,
              });
            } else if (res.statusCode == 401) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'Unauthorized. ' + result.error,
                result: undefined,
              });
            } else if (res.statusCode == 503) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'PDFreactor Web Service is unavailable.',
                result: result,
              });
            } else {
              err = {
                message:
                  'PDFreactor Web Service error (status: ' +
                  res.statusCode +
                  ').',
              };
            }
            return reject(err);
          }
        });
      });
      req.on('error', (e: any) => {
        return reject({
          message:
            'Error connecting to PDFreactor Web Service at ' +
            this._serviceUrl +
            '. Please make sure the PDFreactor Web Service is installed and running (' +
            e +
            ')',
          event: e,
        });
      });
      req.end();
    });
  }
  getDocumentAsBinary(
    documentId: string,
    writeStream: any,
    connectionSettings?: any
  ) {
    if (
      !(writeStream instanceof stream && typeof writeStream.write == 'function')
    ) {
      connectionSettings = writeStream;
      writeStream = undefined;
    }
    return new Promise<void | string>((resolve, reject) => {
      let restUrl = this._serviceUrl + '/document/' + documentId + '.bin';
      if (this.apiKey) {
        restUrl += '?apiKey=' + this.apiKey;
      }
      const options = url.parse(restUrl);
      options.headers = {};
      if (connectionSettings && connectionSettings.headers) {
        for (const key in connectionSettings.headers) {
          const lcKey = key.toLowerCase();
          if (
            lcKey !== 'user-agent' &&
            lcKey !== 'content-type' &&
            lcKey !== 'range'
          ) {
            options.headers[key] = connectionSettings.headers[key];
          }
        }
      }
      options.headers.cookie = '';
      options.headers['Content-Type'] = 'application/json';
      options.headers['User-Agent'] = 'PDFreactor Node.js API v10';
      options.headers['X-RO-User-Agent'] = 'PDFreactor Node.js API v10';
      options.method = 'get';
      if (connectionSettings && connectionSettings.cookies) {
        //eslint-disable-next-line no-prototype-builtins
        for (const name in connectionSettings.cookies) {
          //eslint-disable-next-line no-prototype-builtins
          if (connectionSettings.cookies.hasOwnProperty(name)) {
            options.headers.cookie +=
              name + '=' + connectionSettings.cookies[name] + '; ';
          }
        }
      }
      let errorMode = true;
      let responseText = '';
      const req = this._http.request(options, (res: any) => {
        res.setEncoding('binary');
        res.once('data', () => {
          if (res.statusCode >= 200 && res.statusCode <= 204) {
            errorMode = false;
          }
        });
        res.on('data', (chunk: any) => {
          if (errorMode || !writeStream) {
            responseText += chunk;
          } else if (writeStream) {
            writeStream.write(chunk, 'binary');
          }
        });
        res.on('end', (e: any) => {
          if (writeStream) {
            writeStream.end();
            if (!errorMode) {
              return resolve();
            }
          }
          if (!errorMode) {
            return resolve(responseText);
          } else {
            const errorId = res.headers['X-RO-Error-ID'];
            let err;
            if (res.statusCode == 422) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: responseText,
                result: undefined,
              });
            } else if (res.statusCode == 404) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message:
                  'Document with the given ID was not found. ' + responseText,
                result: undefined,
              });
            } else if (res.statusCode == 401) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'Unauthorized. ' + responseText,
                result: undefined,
              });
            } else if (res.statusCode == 503) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'PDFreactor Web Service is unavailable.',
                result: undefined,
              });
            } else {
              err = {
                message:
                  'PDFreactor Web Service error (status: ' +
                  res.statusCode +
                  ').',
              };
            }
            return reject(err);
          }
        });
      });
      req.on('error', (e: any) => {
        return reject({
          message:
            'Error connecting to PDFreactor Web Service at ' +
            this._serviceUrl +
            '. Please make sure the PDFreactor Web Service is installed and running (' +
            e +
            ')',
          event: e,
        });
      });
      req.end();
    });
  }
  getDocumentMetadata(documentId: string, connectionSettings?: any) {
    return new Promise((resolve, reject) => {
      let restUrl =
        this._serviceUrl + '/document/metadata/' + documentId + '.json';
      if (this.apiKey) {
        restUrl += '?apiKey=' + this.apiKey;
      }
      const options = url.parse(restUrl);
      options.headers = {};
      if (connectionSettings && connectionSettings.headers) {
        for (const key in connectionSettings.headers) {
          const lcKey = key.toLowerCase();
          if (
            lcKey !== 'user-agent' &&
            lcKey !== 'content-type' &&
            lcKey !== 'range'
          ) {
            options.headers[key] = connectionSettings.headers[key];
          }
        }
      }
      options.headers.cookie = '';
      options.headers['Content-Type'] = 'application/json';
      options.headers['User-Agent'] = 'PDFreactor Node.js API v10';
      options.headers['X-RO-User-Agent'] = 'PDFreactor Node.js API v10';
      options.method = 'get';
      //eslint-disable-next-line no-prototype-builtins
      if (connectionSettings && connectionSettings.cookies) {
        for (const name in connectionSettings.cookies) {
          //eslint-disable-next-line no-prototype-builtins
          if (connectionSettings.cookies.hasOwnProperty(name)) {
            options.headers.cookie +=
              name + '=' + connectionSettings.cookies[name] + '; ';
          }
        }
      }
      let errorMode = true;
      let responseText = '';
      let result = null;
      const req = this._http.request(options, (res: any) => {
        res.setEncoding('utf8');
        res.on('data', (chunk: any) => {
          responseText += chunk;
        });
        res.on('end', (e: any) => {
          if (res.statusCode >= 200 && res.statusCode <= 204) {
            errorMode = false;
          }
          if (!errorMode) {
            return resolve(this._parseJson(responseText));
          } else {
            result = this._parseJson(responseText);
            const errorId = res.headers['X-RO-Error-ID'];
            let err;
            if (res.statusCode == 422) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: result.error,
                result: result,
              });
            } else if (res.statusCode == 404) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message:
                  'Document with the given ID was not found. ' + result.error,
                result: undefined,
              });
            } else if (res.statusCode == 401) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'Unauthorized. ' + result.error,
                result: undefined,
              });
            } else if (res.statusCode == 503) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'PDFreactor Web Service is unavailable.',
                result: result,
              });
            } else {
              err = {
                message:
                  'PDFreactor Web Service error (status: ' +
                  res.statusCode +
                  ').',
              };
            }
            return reject(err);
          }
        });
      });
      req.on('error', (e: any) => {
        return reject({
          message:
            'Error connecting to PDFreactor Web Service at ' +
            this._serviceUrl +
            '. Please make sure the PDFreactor Web Service is installed and running (' +
            e +
            ')',
          event: e,
        });
      });
      req.end();
    });
  }
  deleteDocument(documentId: string, connectionSettings?: any) {
    return new Promise<void | string>((resolve, reject) => {
      let restUrl = this._serviceUrl + '/document/' + documentId + '.json';
      if (this.apiKey) {
        restUrl += '?apiKey=' + this.apiKey;
      }
      const options = url.parse(restUrl);
      options.headers = {};
      if (connectionSettings && connectionSettings.headers) {
        for (const key in connectionSettings.headers) {
          const lcKey = key.toLowerCase();
          if (
            lcKey !== 'user-agent' &&
            lcKey !== 'content-type' &&
            lcKey !== 'range'
          ) {
            options.headers[key] = connectionSettings.headers[key];
          }
        }
      }
      options.headers.cookie = '';
      options.headers['Content-Type'] = 'application/json';
      options.headers['User-Agent'] = 'PDFreactor Node.js API v10';
      options.headers['X-RO-User-Agent'] = 'PDFreactor Node.js API v10';
      //eslint-disable-next-line no-prototype-builtins
      options.method = 'delete';
      if (connectionSettings && connectionSettings.cookies) {
        //eslint-disable-next-line no-prototype-builtins
        for (const name in connectionSettings.cookies) {
          //eslint-disable-next-line no-prototype-builtins
          if (connectionSettings.cookies.hasOwnProperty(name)) {
            options.headers.cookie +=
              name + '=' + connectionSettings.cookies[name] + '; ';
          }
        }
      }
      let errorMode = true;
      let responseText = '';
      let result = null;
      const req = this._http.request(options, (res: any) => {
        res.setEncoding('utf8');
        res.on('data', (chunk: any) => {
          responseText += chunk;
        });
        res.on('end', (e: any) => {
          if (res.statusCode >= 200 && res.statusCode <= 204) {
            errorMode = false;
          }
          if (!errorMode) {
            return resolve();
          } else {
            result = this._parseJson(responseText);
            const errorId = res.headers['X-RO-Error-ID'];
            let err;
            if (res.statusCode == 404) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message:
                  'Document with the given ID was not found. ' + result.error,
                result: undefined,
              });
            } else if (res.statusCode == 401) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'Unauthorized. ' + result.error,
                result: undefined,
              });
            } else if (res.statusCode == 503) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'PDFreactor Web Service is unavailable.',
                result: result,
              });
            } else {
              err = {
                message:
                  'PDFreactor Web Service error (status: ' +
                  res.statusCode +
                  ').',
              };
            }
            return reject(err);
          }
        });
      });
      req.on('error', (e: any) => {
        return reject({
          message:
            'Error connecting to PDFreactor Web Service at ' +
            this._serviceUrl +
            '. Please make sure the PDFreactor Web Service is installed and running (' +
            e +
            ')',
          event: e,
        });
      });
      req.end();
    });
  }
  getStatus(connectionSettings?: any) {
    return new Promise<void | string>((resolve, reject) => {
      let restUrl = this._serviceUrl + '/status.json';
      if (this.apiKey) {
        restUrl += '?apiKey=' + this.apiKey;
      }
      const options = url.parse(restUrl);
      options.headers = {};
      if (connectionSettings && connectionSettings.headers) {
        for (const key in connectionSettings.headers) {
          const lcKey = key.toLowerCase();
          if (
            lcKey !== 'user-agent' &&
            lcKey !== 'content-type' &&
            lcKey !== 'range'
          ) {
            options.headers[key] = connectionSettings.headers[key];
          }
        }
      }
      options.headers.cookie = '';
      options.headers['Content-Type'] = 'application/json';
      options.headers['User-Agent'] = 'PDFreactor Node.js API v10';
      //eslint-disable-next-line no-prototype-builtins
      options.headers['X-RO-User-Agent'] = 'PDFreactor Node.js API v10';
      options.method = 'get';
      //eslint-disable-next-line no-prototype-builtins
      if (connectionSettings && connectionSettings.cookies) {
        for (const name in connectionSettings.cookies) {
          //eslint-disable-next-line no-prototype-builtins
          if (connectionSettings.cookies.hasOwnProperty(name)) {
            options.headers.cookie +=
              name + '=' + connectionSettings.cookies[name] + '; ';
          }
        }
      }
      let errorMode = true;
      let responseText = '';
      let result = null;
      const req = this._http.request(options, (res: any) => {
        res.setEncoding('utf8');
        res.on('data', (chunk: any) => {
          responseText += chunk;
        });
        res.on('end', (e: any) => {
          if (res.statusCode >= 200 && res.statusCode <= 204) {
            errorMode = false;
          }
          if (!errorMode) {
            return resolve();
          } else {
            result = this._parseJson(responseText);
            const errorId = res.headers['X-RO-Error-ID'];
            let err;
            if (res.statusCode == 401) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'Unauthorized. ' + result.error,
                result: undefined,
              });
            } else if (res.statusCode == 503) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'PDFreactor Web Service is unavailable.',
                result: result,
              });
            } else {
              err = {
                message:
                  'PDFreactor Web Service error (status: ' +
                  res.statusCode +
                  ').',
              };
            }
            return reject(err);
          }
        });
      });
      req.on('error', (e: any) => {
        return reject({
          message:
            'Error connecting to PDFreactor Web Service at ' +
            this._serviceUrl +
            '. Please make sure the PDFreactor Web Service is installed and running (' +
            e +
            ')',
          event: e,
        });
      });
      req.end();
    });
  }
  getVersion(connectionSettings?: any) {
    return new Promise((resolve, reject) => {
      let restUrl = this._serviceUrl + '/version.json';
      if (this.apiKey) {
        restUrl += '?apiKey=' + this.apiKey;
      }
      const options = url.parse(restUrl);
      options.headers = {};
      if (connectionSettings && connectionSettings.headers) {
        for (const key in connectionSettings.headers) {
          const lcKey = key.toLowerCase();
          if (
            lcKey !== 'user-agent' &&
            lcKey !== 'content-type' &&
            lcKey !== 'range'
          ) {
            options.headers[key] = connectionSettings.headers[key];
          }
        }
      }
      options.headers.cookie = '';
      options.headers['Content-Type'] = 'application/json';
      //eslint-disable-next-line no-prototype-builtins
      options.headers['User-Agent'] = 'PDFreactor Node.js API v10';
      options.headers['X-RO-User-Agent'] = 'PDFreactor Node.js API v10';
      options.method = 'get';
      //eslint-disable-next-line no-prototype-builtins
      if (connectionSettings && connectionSettings.cookies) {
        //eslint-disable-next-line no-prototype-builtins
        for (const name in connectionSettings.cookies) {
          //eslint-disable-next-line no-prototype-builtins
          if (connectionSettings.cookies.hasOwnProperty(name)) {
            options.headers.cookie +=
              name + '=' + connectionSettings.cookies[name] + '; ';
          }
        }
      }
      let errorMode = true;
      let responseText = '';
      let result = null;
      const req = this._http.request(options, (res: any) => {
        res.setEncoding('utf8');
        res.on('data', (chunk: any) => {
          responseText += chunk;
        });
        res.on('end', (e: any) => {
          if (res.statusCode >= 200 && res.statusCode <= 204) {
            errorMode = false;
          }
          if (!errorMode) {
            return resolve(this._parseJson(responseText));
          } else {
            result = this._parseJson(responseText);
            const errorId = res.headers['X-RO-Error-ID'];
            let err;
            if (res.statusCode == 401) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'Unauthorized. ' + result.error,
                result: undefined,
              });
            } else if (res.statusCode == 503) {
              err = PDFreactor._createServerError({
                errorId: errorId,
                event: e,
                message: 'PDFreactor Web Service is unavailable.',
                result: result,
              });
            } else {
              err = {
                message:
                  'PDFreactor Web Service error (status: ' +
                  res.statusCode +
                  ').',
              };
            }
            return reject(err);
          }
        });
      });
      req.on('error', (e: any) => {
        return reject({
          message:
            'Error connecting to PDFreactor Web Service at ' +
            this._serviceUrl +
            '. Please make sure the PDFreactor Web Service is installed and running (' +
            e +
            ')',
          event: e,
        });
      });
      req.end();
    });
  }
  getDocumentUrl(documentId?: string) {
    if (documentId) {
      return this._serviceUrl + '/document/' + documentId;
    }
  }
  getProgressUrl(documentId?: string) {
    if (documentId) {
      return this._serviceUrl + '/progress/' + documentId;
    }
  }
  get apiKey() {
    return this._apiKey;
  }
  set apiKey(value) {
    this._apiKey = value;
  }
  _parseJson(string: string) {
    try {
      return JSON.parse(string);
    } catch (e) {
      return { error: '' };
    }
  }
}
PDFreactor._createServerError = function (data: any) {
  switch (data.errorId) {
    case 'asyncUnavailable':
      return new PDFreactor.AsyncUnavailableError(data);
    case 'badRequest':
      return new PDFreactor.BadRequestError(data);
    case 'commandRejected':
      return new PDFreactor.CommandRejectedError(data);
    case 'conversionAborted':
      return new PDFreactor.ConversionAbortedError(data);
    case 'conversionFailure':
      return new PDFreactor.ConversionFailureError(data);
    case 'documentNotFound':
      return new PDFreactor.DocumentNotFoundError(data);
    case 'resourceNotFound':
      return new PDFreactor.ResourceNotFoundError(data);
    case 'invalidClient':
      return new PDFreactor.InvalidClientError(data);
    case 'invalidConfiguration':
      return new PDFreactor.InvalidConfigurationError(data);
    case 'noConfiguration':
      return new PDFreactor.NoConfigurationError(data);
    case 'noInputDocument':
      return new PDFreactor.NoInputDocumentError(data);
    case 'requestRejected':
      return new PDFreactor.RequestRejectedError(data);
    case 'serviceUnavailable':
      return new PDFreactor.ServiceUnavailableError(data);
    case 'unauthorized':
      return new PDFreactor.UnauthorizedError(data);
    case 'unprocessableConfiguration':
      return new PDFreactor.UnprocessableConfigurationError(data);
    case 'unprocessableInput':
      return new PDFreactor.UnprocessableInputError(data);
    case 'notAcceptable':
      return new PDFreactor.NotAcceptableError(data);
    default:
      return new PDFreactor.ServerError(data);
  }
};
PDFreactor.PDFreactorWebserviceError = function (data: any) {
  data = data || {};
  this.message = data.message || 'Unknown PDFreactor Web Service error';
  this.event = data.event;
};
PDFreactor.ClientError = function (data: any) {
  PDFreactor.PDFreactorWebserviceError.call(this, data);
};
PDFreactor.ClientError.prototype =
  PDFreactor.PDFreactorWebserviceError.prototype;
PDFreactor.ServerError = function (data: any) {
  data = data || {};
  PDFreactor.PDFreactorWebserviceError.call(this, data);
  this.errorId = data.errorId;
  this.result = data.result;
};
PDFreactor.ServerError.prototype =
  PDFreactor.PDFreactorWebserviceError.prototype;
PDFreactor.AsyncUnavailableError = function (data: any) {
  PDFreactor.ServerError.call(this, data);
};
PDFreactor.AsyncUnavailableError.prototype = PDFreactor.ServerError.prototype;
PDFreactor.BadRequestError = function (data: any) {
  PDFreactor.ServerError.call(this, data);
};
PDFreactor.BadRequestError.prototype = PDFreactor.ServerError.prototype;
PDFreactor.CommandRejectedError = function (data: any) {
  PDFreactor.ServerError.call(this, data);
};
PDFreactor.CommandRejectedError.prototype = PDFreactor.ServerError.prototype;
PDFreactor.ConversionAbortedError = function (data: any) {
  PDFreactor.ServerError.call(this, data);
};
PDFreactor.ConversionAbortedError.prototype = PDFreactor.ServerError.prototype;
PDFreactor.ConversionFailureError = function (data: any) {
  PDFreactor.ServerError.call(this, data);
};
PDFreactor.ConversionFailureError.prototype = PDFreactor.ServerError.prototype;
PDFreactor.DocumentNotFoundError = function (data: any) {
  PDFreactor.ServerError.call(this, data);
};
PDFreactor.DocumentNotFoundError.prototype = PDFreactor.ServerError.prototype;
PDFreactor.ResourceNotFoundError = function (data: any) {
  PDFreactor.ServerError.call(this, data);
};
PDFreactor.ResourceNotFoundError.prototype = PDFreactor.ServerError.prototype;
PDFreactor.InvalidClientError = function (data: any) {
  PDFreactor.ServerError.call(this, data);
};
PDFreactor.InvalidClientError.prototype = PDFreactor.ServerError.prototype;
PDFreactor.InvalidConfigurationError = function (data: any) {
  PDFreactor.ServerError.call(this, data);
};
PDFreactor.InvalidConfigurationError.prototype =
  PDFreactor.ServerError.prototype;
PDFreactor.NoConfigurationError = function (data: any) {
  PDFreactor.ServerError.call(this, data);
};
PDFreactor.NoConfigurationError.prototype = PDFreactor.ServerError.prototype;
PDFreactor.NoInputDocumentError = function (data: any) {
  PDFreactor.ServerError.call(this, data);
};
PDFreactor.NoInputDocumentError.prototype = PDFreactor.ServerError.prototype;
PDFreactor.RequestRejectedError = function (data: any) {
  PDFreactor.ServerError.call(this, data);
};
PDFreactor.RequestRejectedError.prototype = PDFreactor.ServerError.prototype;
PDFreactor.ServiceUnavailableError = function (data: any) {
  PDFreactor.ServerError.call(this, data);
};
PDFreactor.ServiceUnavailableError.prototype = PDFreactor.ServerError.prototype;
PDFreactor.UnauthorizedError = function (data: any) {
  PDFreactor.ServerError.call(this, data);
};
PDFreactor.UnauthorizedError.prototype = PDFreactor.ServerError.prototype;
PDFreactor.UnprocessableConfigurationError = function (data: any) {
  PDFreactor.ServerError.call(this, data);
};
PDFreactor.UnprocessableConfigurationError.prototype =
  PDFreactor.ServerError.prototype;
PDFreactor.UnprocessableInputError = function (data: any) {
  PDFreactor.ServerError.call(this, data);
};
PDFreactor.UnprocessableInputError.prototype = PDFreactor.ServerError.prototype;
PDFreactor.NotAcceptableError = function (data: any) {
  PDFreactor.ServerError.call(this, data);
};
PDFreactor.NotAcceptableError.prototype = PDFreactor.ServerError.prototype;
PDFreactor.UnreachableServiceError = function (data: any) {
  PDFreactor.ClientError.call(this, data);
};
PDFreactor.UnreachableServiceError.prototype = PDFreactor.ClientError.prototype;
PDFreactor.InvalidServiceError = function (data: any) {
  PDFreactor.ClientError.call(this, data);
};
PDFreactor.InvalidServiceError.prototype = PDFreactor.ClientError.prototype;
Object.defineProperty(PDFreactor, 'CallbackType', {
  value: {},
});
Object.defineProperty(PDFreactor.CallbackType, 'FINISH', {
  value: 'FINISH',
});
Object.defineProperty(PDFreactor.CallbackType, 'PROGRESS', {
  value: 'PROGRESS',
});
Object.defineProperty(PDFreactor.CallbackType, 'START', {
  value: 'START',
});
Object.defineProperty(PDFreactor, 'Cleanup', {
  value: {},
});
Object.defineProperty(PDFreactor.Cleanup, 'CYBERNEKO', {
  value: 'CYBERNEKO',
});
Object.defineProperty(PDFreactor.Cleanup, 'JTIDY', {
  value: 'JTIDY',
});
Object.defineProperty(PDFreactor.Cleanup, 'NONE', {
  value: 'NONE',
});
Object.defineProperty(PDFreactor.Cleanup, 'TAGSOUP', {
  value: 'TAGSOUP',
});
Object.defineProperty(PDFreactor, 'ColorSpace', {
  value: {},
});
Object.defineProperty(PDFreactor.ColorSpace, 'CMYK', {
  value: 'CMYK',
});
Object.defineProperty(PDFreactor.ColorSpace, 'RGB', {
  value: 'RGB',
});
Object.defineProperty(PDFreactor, 'Conformance', {
  value: {},
});
Object.defineProperty(PDFreactor.Conformance, 'PDF', {
  value: 'PDF',
});
Object.defineProperty(PDFreactor.Conformance, 'PDFA1A', {
  value: 'PDFA1A',
});
Object.defineProperty(PDFreactor.Conformance, 'PDFA1A_PDFUA1', {
  value: 'PDFA1A_PDFUA1',
});
Object.defineProperty(PDFreactor.Conformance, 'PDFA1B', {
  value: 'PDFA1B',
});
Object.defineProperty(PDFreactor.Conformance, 'PDFA2A', {
  value: 'PDFA2A',
});
Object.defineProperty(PDFreactor.Conformance, 'PDFA2A_PDFUA1', {
  value: 'PDFA2A_PDFUA1',
});
Object.defineProperty(PDFreactor.Conformance, 'PDFA2B', {
  value: 'PDFA2B',
});
Object.defineProperty(PDFreactor.Conformance, 'PDFA2U', {
  value: 'PDFA2U',
});
Object.defineProperty(PDFreactor.Conformance, 'PDFA3A', {
  value: 'PDFA3A',
});
Object.defineProperty(PDFreactor.Conformance, 'PDFA3A_PDFUA1', {
  value: 'PDFA3A_PDFUA1',
});
Object.defineProperty(PDFreactor.Conformance, 'PDFA3B', {
  value: 'PDFA3B',
});
Object.defineProperty(PDFreactor.Conformance, 'PDFA3U', {
  value: 'PDFA3U',
});
Object.defineProperty(PDFreactor.Conformance, 'PDFUA1', {
  value: 'PDFUA1',
});
Object.defineProperty(PDFreactor.Conformance, 'PDFX1A_2001', {
  value: 'PDFX1A_2001',
});
Object.defineProperty(PDFreactor.Conformance, 'PDFX1A_2003', {
  value: 'PDFX1A_2003',
});
Object.defineProperty(PDFreactor.Conformance, 'PDFX3_2002', {
  value: 'PDFX3_2002',
});
Object.defineProperty(PDFreactor.Conformance, 'PDFX3_2003', {
  value: 'PDFX3_2003',
});
Object.defineProperty(PDFreactor.Conformance, 'PDFX4', {
  value: 'PDFX4',
});
Object.defineProperty(PDFreactor.Conformance, 'PDFX4P', {
  value: 'PDFX4P',
});
Object.defineProperty(PDFreactor, 'ContentType', {
  value: {},
});
Object.defineProperty(PDFreactor.ContentType, 'BINARY', {
  value: 'BINARY',
});
Object.defineProperty(PDFreactor.ContentType, 'BMP', {
  value: 'BMP',
});
Object.defineProperty(PDFreactor.ContentType, 'GIF', {
  value: 'GIF',
});
Object.defineProperty(PDFreactor.ContentType, 'HTML', {
  value: 'HTML',
});
Object.defineProperty(PDFreactor.ContentType, 'JPEG', {
  value: 'JPEG',
});
Object.defineProperty(PDFreactor.ContentType, 'JSON', {
  value: 'JSON',
});
Object.defineProperty(PDFreactor.ContentType, 'NONE', {
  value: 'NONE',
});
Object.defineProperty(PDFreactor.ContentType, 'PDF', {
  value: 'PDF',
});
Object.defineProperty(PDFreactor.ContentType, 'PNG', {
  value: 'PNG',
});
Object.defineProperty(PDFreactor.ContentType, 'TEXT', {
  value: 'TEXT',
});
Object.defineProperty(PDFreactor.ContentType, 'TIFF', {
  value: 'TIFF',
});
Object.defineProperty(PDFreactor.ContentType, 'XML', {
  value: 'XML',
});
Object.defineProperty(PDFreactor, 'CssPropertySupport', {
  value: {},
});
Object.defineProperty(PDFreactor.CssPropertySupport, 'ALL', {
  value: 'ALL',
});
Object.defineProperty(PDFreactor.CssPropertySupport, 'HTML', {
  value: 'HTML',
});
Object.defineProperty(PDFreactor.CssPropertySupport, 'HTML_THIRD_PARTY', {
  value: 'HTML_THIRD_PARTY',
});
Object.defineProperty(
  PDFreactor.CssPropertySupport,
  'HTML_THIRD_PARTY_LENIENT',
  {
    value: 'HTML_THIRD_PARTY_LENIENT',
  }
);
Object.defineProperty(PDFreactor, 'Doctype', {
  value: {},
});
Object.defineProperty(PDFreactor.Doctype, 'AUTODETECT', {
  value: 'AUTODETECT',
});
Object.defineProperty(PDFreactor.Doctype, 'HTML5', {
  value: 'HTML5',
});
Object.defineProperty(PDFreactor.Doctype, 'XHTML', {
  value: 'XHTML',
});
Object.defineProperty(PDFreactor.Doctype, 'XML', {
  value: 'XML',
});
Object.defineProperty(PDFreactor, 'Encryption', {
  value: {},
});
Object.defineProperty(PDFreactor.Encryption, 'NONE', {
  value: 'NONE',
});
Object.defineProperty(PDFreactor.Encryption, 'TYPE_128', {
  value: 'TYPE_128',
});
Object.defineProperty(PDFreactor.Encryption, 'TYPE_40', {
  value: 'TYPE_40',
});
Object.defineProperty(PDFreactor, 'ErrorPolicy', {
  value: {},
});
Object.defineProperty(
  PDFreactor.ErrorPolicy,
  'CONFORMANCE_VALIDATION_UNAVAILABLE',
  {
    value: 'CONFORMANCE_VALIDATION_UNAVAILABLE',
  }
);
Object.defineProperty(PDFreactor.ErrorPolicy, 'LICENSE', {
  value: 'LICENSE',
});
Object.defineProperty(PDFreactor.ErrorPolicy, 'MISSING_RESOURCE', {
  value: 'MISSING_RESOURCE',
});
Object.defineProperty(PDFreactor.ErrorPolicy, 'UNCAUGHT_JAVASCRIPT_EXCEPTION', {
  value: 'UNCAUGHT_JAVASCRIPT_EXCEPTION',
});
Object.defineProperty(PDFreactor, 'ExceedingContentAgainst', {
  value: {},
});
Object.defineProperty(PDFreactor.ExceedingContentAgainst, 'NONE', {
  value: 'NONE',
});
Object.defineProperty(PDFreactor.ExceedingContentAgainst, 'PAGE_BORDERS', {
  value: 'PAGE_BORDERS',
});
Object.defineProperty(PDFreactor.ExceedingContentAgainst, 'PAGE_CONTENT', {
  value: 'PAGE_CONTENT',
});
Object.defineProperty(PDFreactor.ExceedingContentAgainst, 'PARENT', {
  value: 'PARENT',
});
Object.defineProperty(PDFreactor, 'ExceedingContentAnalyze', {
  value: {},
});
Object.defineProperty(PDFreactor.ExceedingContentAnalyze, 'CONTENT', {
  value: 'CONTENT',
});
Object.defineProperty(PDFreactor.ExceedingContentAnalyze, 'CONTENT_AND_BOXES', {
  value: 'CONTENT_AND_BOXES',
});
Object.defineProperty(
  PDFreactor.ExceedingContentAnalyze,
  'CONTENT_AND_STATIC_BOXES',
  {
    value: 'CONTENT_AND_STATIC_BOXES',
  }
);
Object.defineProperty(PDFreactor.ExceedingContentAnalyze, 'NONE', {
  value: 'NONE',
});
Object.defineProperty(PDFreactor, 'HttpsMode', {
  value: {},
});
Object.defineProperty(PDFreactor.HttpsMode, 'LENIENT', {
  value: 'LENIENT',
});
Object.defineProperty(PDFreactor.HttpsMode, 'STRICT', {
  value: 'STRICT',
});
Object.defineProperty(PDFreactor, 'JavaScriptDebugMode', {
  value: {},
});
Object.defineProperty(PDFreactor.JavaScriptDebugMode, 'EXCEPTIONS', {
  value: 'EXCEPTIONS',
});
Object.defineProperty(PDFreactor.JavaScriptDebugMode, 'FUNCTIONS', {
  value: 'FUNCTIONS',
});
Object.defineProperty(PDFreactor.JavaScriptDebugMode, 'LINES', {
  value: 'LINES',
});
Object.defineProperty(PDFreactor.JavaScriptDebugMode, 'NONE', {
  value: 'NONE',
});
Object.defineProperty(PDFreactor.JavaScriptDebugMode, 'POSITIONS', {
  value: 'POSITIONS',
});
Object.defineProperty(PDFreactor, 'JavaScriptMode', {
  value: {},
});
Object.defineProperty(PDFreactor.JavaScriptMode, 'DISABLED', {
  value: 'DISABLED',
});
Object.defineProperty(PDFreactor.JavaScriptMode, 'ENABLED', {
  value: 'ENABLED',
});
Object.defineProperty(PDFreactor.JavaScriptMode, 'ENABLED_NO_LAYOUT', {
  value: 'ENABLED_NO_LAYOUT',
});
Object.defineProperty(PDFreactor.JavaScriptMode, 'ENABLED_REAL_TIME', {
  value: 'ENABLED_REAL_TIME',
});
Object.defineProperty(PDFreactor.JavaScriptMode, 'ENABLED_TIME_LAPSE', {
  value: 'ENABLED_TIME_LAPSE',
});
Object.defineProperty(PDFreactor, 'KeystoreType', {
  value: {},
});
Object.defineProperty(PDFreactor.KeystoreType, 'JKS', {
  value: 'JKS',
});
Object.defineProperty(PDFreactor.KeystoreType, 'PKCS12', {
  value: 'PKCS12',
});
Object.defineProperty(PDFreactor, 'LogLevel', {
  value: {},
});
Object.defineProperty(PDFreactor.LogLevel, 'DEBUG', {
  value: 'DEBUG',
});
Object.defineProperty(PDFreactor.LogLevel, 'FATAL', {
  value: 'FATAL',
});
Object.defineProperty(PDFreactor.LogLevel, 'INFO', {
  value: 'INFO',
});
Object.defineProperty(PDFreactor.LogLevel, 'NONE', {
  value: 'NONE',
});
Object.defineProperty(PDFreactor.LogLevel, 'PERFORMANCE', {
  value: 'PERFORMANCE',
});
Object.defineProperty(PDFreactor.LogLevel, 'WARN', {
  value: 'WARN',
});
Object.defineProperty(PDFreactor, 'MediaFeature', {
  value: {},
});
Object.defineProperty(PDFreactor.MediaFeature, 'ASPECT_RATIO', {
  value: 'ASPECT_RATIO',
});
Object.defineProperty(PDFreactor.MediaFeature, 'COLOR', {
  value: 'COLOR',
});
Object.defineProperty(PDFreactor.MediaFeature, 'COLOR_INDEX', {
  value: 'COLOR_INDEX',
});
Object.defineProperty(PDFreactor.MediaFeature, 'DEVICE_ASPECT_RATIO', {
  value: 'DEVICE_ASPECT_RATIO',
});
Object.defineProperty(PDFreactor.MediaFeature, 'DEVICE_HEIGHT', {
  value: 'DEVICE_HEIGHT',
});
Object.defineProperty(PDFreactor.MediaFeature, 'DEVICE_WIDTH', {
  value: 'DEVICE_WIDTH',
});
Object.defineProperty(PDFreactor.MediaFeature, 'GRID', {
  value: 'GRID',
});
Object.defineProperty(PDFreactor.MediaFeature, 'HEIGHT', {
  value: 'HEIGHT',
});
Object.defineProperty(PDFreactor.MediaFeature, 'MONOCHROME', {
  value: 'MONOCHROME',
});
Object.defineProperty(PDFreactor.MediaFeature, 'ORIENTATION', {
  value: 'ORIENTATION',
});
Object.defineProperty(PDFreactor.MediaFeature, 'RESOLUTION', {
  value: 'RESOLUTION',
});
Object.defineProperty(PDFreactor.MediaFeature, 'WIDTH', {
  value: 'WIDTH',
});
Object.defineProperty(PDFreactor, 'MergeMode', {
  value: {},
});
Object.defineProperty(PDFreactor.MergeMode, 'APPEND', {
  value: 'APPEND',
});
Object.defineProperty(PDFreactor.MergeMode, 'ARRANGE', {
  value: 'ARRANGE',
});
Object.defineProperty(PDFreactor.MergeMode, 'OVERLAY', {
  value: 'OVERLAY',
});
Object.defineProperty(PDFreactor.MergeMode, 'OVERLAY_BELOW', {
  value: 'OVERLAY_BELOW',
});
Object.defineProperty(PDFreactor.MergeMode, 'PREPEND', {
  value: 'PREPEND',
});
Object.defineProperty(PDFreactor, 'OutputIntentDefaultProfile', {
  value: {},
});
Object.defineProperty(PDFreactor.OutputIntentDefaultProfile, 'FOGRA39', {
  value: 'Coated FOGRA39',
});
Object.defineProperty(PDFreactor.OutputIntentDefaultProfile, 'GRACOL', {
  value: 'Coated GRACoL 2006',
});
Object.defineProperty(PDFreactor.OutputIntentDefaultProfile, 'IFRA', {
  value: 'ISO News print 26% (IFRA)',
});
Object.defineProperty(PDFreactor.OutputIntentDefaultProfile, 'JAPAN', {
  value: 'Japan Color 2001 Coated',
});
Object.defineProperty(
  PDFreactor.OutputIntentDefaultProfile,
  'JAPAN_NEWSPAPER',
  {
    value: 'Japan Color 2001 Newspaper',
  }
);
Object.defineProperty(PDFreactor.OutputIntentDefaultProfile, 'JAPAN_UNCOATED', {
  value: 'Japan Color 2001 Uncoated',
});
Object.defineProperty(PDFreactor.OutputIntentDefaultProfile, 'JAPAN_WEB', {
  value: 'Japan Web Coated (Ad)',
});
Object.defineProperty(PDFreactor.OutputIntentDefaultProfile, 'SWOP', {
  value: 'US Web Coated (SWOP) v2',
});
Object.defineProperty(PDFreactor.OutputIntentDefaultProfile, 'SWOP_3', {
  value: 'Web Coated SWOP 2006 Grade 3 Paper',
});
Object.defineProperty(PDFreactor, 'OutputType', {
  value: {},
});
Object.defineProperty(PDFreactor.OutputType, 'BMP', {
  value: 'BMP',
});
Object.defineProperty(PDFreactor.OutputType, 'GIF', {
  value: 'GIF',
});
Object.defineProperty(PDFreactor.OutputType, 'GIF_DITHERED', {
  value: 'GIF_DITHERED',
});
Object.defineProperty(PDFreactor.OutputType, 'JPEG', {
  value: 'JPEG',
});
Object.defineProperty(PDFreactor.OutputType, 'PDF', {
  value: 'PDF',
});
Object.defineProperty(PDFreactor.OutputType, 'PNG', {
  value: 'PNG',
});
Object.defineProperty(PDFreactor.OutputType, 'PNG_AI', {
  value: 'PNG_AI',
});
Object.defineProperty(PDFreactor.OutputType, 'PNG_TRANSPARENT', {
  value: 'PNG_TRANSPARENT',
});
Object.defineProperty(PDFreactor.OutputType, 'PNG_TRANSPARENT_AI', {
  value: 'PNG_TRANSPARENT_AI',
});
Object.defineProperty(PDFreactor.OutputType, 'TIFF_CCITT_1D', {
  value: 'TIFF_CCITT_1D',
});
Object.defineProperty(PDFreactor.OutputType, 'TIFF_CCITT_1D_DITHERED', {
  value: 'TIFF_CCITT_1D_DITHERED',
});
Object.defineProperty(PDFreactor.OutputType, 'TIFF_CCITT_GROUP_3', {
  value: 'TIFF_CCITT_GROUP_3',
});
Object.defineProperty(PDFreactor.OutputType, 'TIFF_CCITT_GROUP_3_DITHERED', {
  value: 'TIFF_CCITT_GROUP_3_DITHERED',
});
Object.defineProperty(PDFreactor.OutputType, 'TIFF_CCITT_GROUP_4', {
  value: 'TIFF_CCITT_GROUP_4',
});
Object.defineProperty(PDFreactor.OutputType, 'TIFF_CCITT_GROUP_4_DITHERED', {
  value: 'TIFF_CCITT_GROUP_4_DITHERED',
});
Object.defineProperty(PDFreactor.OutputType, 'TIFF_LZW', {
  value: 'TIFF_LZW',
});
Object.defineProperty(PDFreactor.OutputType, 'TIFF_PACKBITS', {
  value: 'TIFF_PACKBITS',
});
Object.defineProperty(PDFreactor.OutputType, 'TIFF_UNCOMPRESSED', {
  value: 'TIFF_UNCOMPRESSED',
});
Object.defineProperty(PDFreactor, 'OverlayRepeat', {
  value: {},
});
Object.defineProperty(PDFreactor.OverlayRepeat, 'ALL_PAGES', {
  value: 'ALL_PAGES',
});
Object.defineProperty(PDFreactor.OverlayRepeat, 'LAST_PAGE', {
  value: 'LAST_PAGE',
});
Object.defineProperty(PDFreactor.OverlayRepeat, 'NONE', {
  value: 'NONE',
});
Object.defineProperty(PDFreactor.OverlayRepeat, 'TRIM', {
  value: 'TRIM',
});
Object.defineProperty(PDFreactor, 'PageOrder', {
  value: {},
});
Object.defineProperty(PDFreactor.PageOrder, 'BOOKLET', {
  value: 'BOOKLET',
});
Object.defineProperty(PDFreactor.PageOrder, 'BOOKLET_RTL', {
  value: 'BOOKLET_RTL',
});
Object.defineProperty(PDFreactor.PageOrder, 'EVEN', {
  value: 'EVEN',
});
Object.defineProperty(PDFreactor.PageOrder, 'ODD', {
  value: 'ODD',
});
Object.defineProperty(PDFreactor.PageOrder, 'REVERSE', {
  value: 'REVERSE',
});
Object.defineProperty(PDFreactor, 'PagesPerSheetDirection', {
  value: {},
});
Object.defineProperty(PDFreactor.PagesPerSheetDirection, 'DOWN_LEFT', {
  value: 'DOWN_LEFT',
});
Object.defineProperty(PDFreactor.PagesPerSheetDirection, 'DOWN_RIGHT', {
  value: 'DOWN_RIGHT',
});
Object.defineProperty(PDFreactor.PagesPerSheetDirection, 'LEFT_DOWN', {
  value: 'LEFT_DOWN',
});
Object.defineProperty(PDFreactor.PagesPerSheetDirection, 'LEFT_UP', {
  value: 'LEFT_UP',
});
Object.defineProperty(PDFreactor.PagesPerSheetDirection, 'RIGHT_DOWN', {
  value: 'RIGHT_DOWN',
});
Object.defineProperty(PDFreactor.PagesPerSheetDirection, 'RIGHT_UP', {
  value: 'RIGHT_UP',
});
Object.defineProperty(PDFreactor.PagesPerSheetDirection, 'UP_LEFT', {
  value: 'UP_LEFT',
});
Object.defineProperty(PDFreactor.PagesPerSheetDirection, 'UP_RIGHT', {
  value: 'UP_RIGHT',
});
Object.defineProperty(PDFreactor, 'PdfScriptTriggerEvent', {
  value: {},
});
Object.defineProperty(PDFreactor.PdfScriptTriggerEvent, 'AFTER_PRINT', {
  value: 'AFTER_PRINT',
});
Object.defineProperty(PDFreactor.PdfScriptTriggerEvent, 'AFTER_SAVE', {
  value: 'AFTER_SAVE',
});
Object.defineProperty(PDFreactor.PdfScriptTriggerEvent, 'BEFORE_PRINT', {
  value: 'BEFORE_PRINT',
});
Object.defineProperty(PDFreactor.PdfScriptTriggerEvent, 'BEFORE_SAVE', {
  value: 'BEFORE_SAVE',
});
Object.defineProperty(PDFreactor.PdfScriptTriggerEvent, 'CLOSE', {
  value: 'CLOSE',
});
Object.defineProperty(PDFreactor.PdfScriptTriggerEvent, 'OPEN', {
  value: 'OPEN',
});
Object.defineProperty(PDFreactor, 'ProcessingPreferences', {
  value: {},
});
Object.defineProperty(PDFreactor.ProcessingPreferences, 'SAVE_MEMORY_IMAGES', {
  value: 'SAVE_MEMORY_IMAGES',
});
Object.defineProperty(PDFreactor, 'QuirksMode', {
  value: {},
});
Object.defineProperty(PDFreactor.QuirksMode, 'DETECT', {
  value: 'DETECT',
});
Object.defineProperty(PDFreactor.QuirksMode, 'QUIRKS', {
  value: 'QUIRKS',
});
Object.defineProperty(PDFreactor.QuirksMode, 'STANDARDS', {
  value: 'STANDARDS',
});
Object.defineProperty(PDFreactor, 'ResolutionUnit', {
  value: {},
});
Object.defineProperty(PDFreactor.ResolutionUnit, 'DPCM', {
  value: 'DPCM',
});
Object.defineProperty(PDFreactor.ResolutionUnit, 'DPI', {
  value: 'DPI',
});
Object.defineProperty(PDFreactor.ResolutionUnit, 'DPPX', {
  value: 'DPPX',
});
Object.defineProperty(PDFreactor.ResolutionUnit, 'TDPCM', {
  value: 'TDPCM',
});
Object.defineProperty(PDFreactor.ResolutionUnit, 'TDPI', {
  value: 'TDPI',
});
Object.defineProperty(PDFreactor.ResolutionUnit, 'TDPPX', {
  value: 'TDPPX',
});
Object.defineProperty(PDFreactor, 'ResourceType', {
  value: {},
});
Object.defineProperty(PDFreactor.ResourceType, 'ATTACHMENT', {
  value: 'ATTACHMENT',
});
Object.defineProperty(PDFreactor.ResourceType, 'DOCUMENT', {
  value: 'DOCUMENT',
});
Object.defineProperty(PDFreactor.ResourceType, 'FONT', {
  value: 'FONT',
});
Object.defineProperty(PDFreactor.ResourceType, 'ICC_PROFILE', {
  value: 'ICC_PROFILE',
});
Object.defineProperty(PDFreactor.ResourceType, 'IFRAME', {
  value: 'IFRAME',
});
Object.defineProperty(PDFreactor.ResourceType, 'IMAGE', {
  value: 'IMAGE',
});
Object.defineProperty(PDFreactor.ResourceType, 'LICENSEKEY', {
  value: 'LICENSEKEY',
});
Object.defineProperty(PDFreactor.ResourceType, 'MERGE_DOCUMENT', {
  value: 'MERGE_DOCUMENT',
});
Object.defineProperty(PDFreactor.ResourceType, 'OBJECT', {
  value: 'OBJECT',
});
Object.defineProperty(PDFreactor.ResourceType, 'RUNNING_DOCUMENT', {
  value: 'RUNNING_DOCUMENT',
});
Object.defineProperty(PDFreactor.ResourceType, 'SCRIPT', {
  value: 'SCRIPT',
});
Object.defineProperty(PDFreactor.ResourceType, 'STYLESHEET', {
  value: 'STYLESHEET',
});
Object.defineProperty(PDFreactor.ResourceType, 'UNKNOWN', {
  value: 'UNKNOWN',
});
Object.defineProperty(PDFreactor.ResourceType, 'XHR', {
  value: 'XHR',
});
Object.defineProperty(PDFreactor, 'SigningMode', {
  value: {},
});
Object.defineProperty(PDFreactor.SigningMode, 'SELF_SIGNED', {
  value: 'SELF_SIGNED',
});
Object.defineProperty(PDFreactor.SigningMode, 'VERISIGN_SIGNED', {
  value: 'VERISIGN_SIGNED',
});
Object.defineProperty(PDFreactor.SigningMode, 'WINCER_SIGNED', {
  value: 'WINCER_SIGNED',
});
Object.defineProperty(PDFreactor, 'ViewerPreferences', {
  value: {},
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'CENTER_WINDOW', {
  value: 'CENTER_WINDOW',
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'DIRECTION_L2R', {
  value: 'DIRECTION_L2R',
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'DIRECTION_R2L', {
  value: 'DIRECTION_R2L',
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'DISPLAY_DOC_TITLE', {
  value: 'DISPLAY_DOC_TITLE',
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'DUPLEX_FLIP_LONG_EDGE', {
  value: 'DUPLEX_FLIP_LONG_EDGE',
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'DUPLEX_FLIP_SHORT_EDGE', {
  value: 'DUPLEX_FLIP_SHORT_EDGE',
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'DUPLEX_SIMPLEX', {
  value: 'DUPLEX_SIMPLEX',
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'FIT_WINDOW', {
  value: 'FIT_WINDOW',
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'HIDE_MENUBAR', {
  value: 'HIDE_MENUBAR',
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'HIDE_TOOLBAR', {
  value: 'HIDE_TOOLBAR',
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'HIDE_WINDOW_UI', {
  value: 'HIDE_WINDOW_UI',
});
Object.defineProperty(
  PDFreactor.ViewerPreferences,
  'NON_FULLSCREEN_PAGE_MODE_USE_NONE',
  {
    value: 'NON_FULLSCREEN_PAGE_MODE_USE_NONE',
  }
);
Object.defineProperty(
  PDFreactor.ViewerPreferences,
  'NON_FULLSCREEN_PAGE_MODE_USE_OC',
  {
    value: 'NON_FULLSCREEN_PAGE_MODE_USE_OC',
  }
);
Object.defineProperty(
  PDFreactor.ViewerPreferences,
  'NON_FULLSCREEN_PAGE_MODE_USE_OUTLINES',
  {
    value: 'NON_FULLSCREEN_PAGE_MODE_USE_OUTLINES',
  }
);
Object.defineProperty(
  PDFreactor.ViewerPreferences,
  'NON_FULLSCREEN_PAGE_MODE_USE_THUMBS',
  {
    value: 'NON_FULLSCREEN_PAGE_MODE_USE_THUMBS',
  }
);
Object.defineProperty(PDFreactor.ViewerPreferences, 'PAGE_LAYOUT_ONE_COLUMN', {
  value: 'PAGE_LAYOUT_ONE_COLUMN',
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'PAGE_LAYOUT_SINGLE_PAGE', {
  value: 'PAGE_LAYOUT_SINGLE_PAGE',
});
Object.defineProperty(
  PDFreactor.ViewerPreferences,
  'PAGE_LAYOUT_TWO_COLUMN_LEFT',
  {
    value: 'PAGE_LAYOUT_TWO_COLUMN_LEFT',
  }
);
Object.defineProperty(
  PDFreactor.ViewerPreferences,
  'PAGE_LAYOUT_TWO_COLUMN_RIGHT',
  {
    value: 'PAGE_LAYOUT_TWO_COLUMN_RIGHT',
  }
);
Object.defineProperty(
  PDFreactor.ViewerPreferences,
  'PAGE_LAYOUT_TWO_PAGE_LEFT',
  {
    value: 'PAGE_LAYOUT_TWO_PAGE_LEFT',
  }
);
Object.defineProperty(
  PDFreactor.ViewerPreferences,
  'PAGE_LAYOUT_TWO_PAGE_RIGHT',
  {
    value: 'PAGE_LAYOUT_TWO_PAGE_RIGHT',
  }
);
Object.defineProperty(PDFreactor.ViewerPreferences, 'PAGE_MODE_FULLSCREEN', {
  value: 'PAGE_MODE_FULLSCREEN',
});
Object.defineProperty(
  PDFreactor.ViewerPreferences,
  'PAGE_MODE_USE_ATTACHMENTS',
  {
    value: 'PAGE_MODE_USE_ATTACHMENTS',
  }
);
Object.defineProperty(PDFreactor.ViewerPreferences, 'PAGE_MODE_USE_NONE', {
  value: 'PAGE_MODE_USE_NONE',
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'PAGE_MODE_USE_OC', {
  value: 'PAGE_MODE_USE_OC',
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'PAGE_MODE_USE_OUTLINES', {
  value: 'PAGE_MODE_USE_OUTLINES',
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'PAGE_MODE_USE_THUMBS', {
  value: 'PAGE_MODE_USE_THUMBS',
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'PICKTRAYBYPDFSIZE_FALSE', {
  value: 'PICKTRAYBYPDFSIZE_FALSE',
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'PICKTRAYBYPDFSIZE_TRUE', {
  value: 'PICKTRAYBYPDFSIZE_TRUE',
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'PRINTSCALING_APPDEFAULT', {
  value: 'PRINTSCALING_APPDEFAULT',
});
Object.defineProperty(PDFreactor.ViewerPreferences, 'PRINTSCALING_NONE', {
  value: 'PRINTSCALING_NONE',
});
Object.defineProperty(PDFreactor, 'XmpPriority', {
  value: {},
});
Object.defineProperty(PDFreactor.XmpPriority, 'HIGH', {
  value: 'HIGH',
});
Object.defineProperty(PDFreactor.XmpPriority, 'LOW', {
  value: 'LOW',
});
Object.defineProperty(PDFreactor.XmpPriority, 'NONE', {
  value: 'NONE',
});
Object.defineProperty(PDFreactor, 'VERSION', {
  value: 10,
});

export default PDFreactor;
