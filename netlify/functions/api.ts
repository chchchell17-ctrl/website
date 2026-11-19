import express from 'express';
import { Readable } from 'node:stream';
import { createAuthRouter } from '../../server/authService.ts';
import { createStudentRouter } from '../../server/studentStateStore.ts';

// Netlify serverless adapter compatible with AWS Lambda / Netlify Functions v1 events
const app = express();
app.set('trust proxy', 1);
app.use('/api/auth', createAuthRouter());
app.use('/api/student', createStudentRouter());

export async function handler(event: {
  httpMethod: string;
  path: string;
  headers?: Record<string, string>;
  body?: string | null;
  isBase64Encoded?: boolean;
}) {
  const normalizedPath = event.path.replace(/^\/\.netlify\/functions\/api/, '') || '/';
  const rawBody = event.body
    ? event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body
    : undefined;

  return new Promise((resolve) => {
    const req = Object.assign(
      new Readable({
        read() {
          if (rawBody) this.push(rawBody);
          this.push(null);
        },
      }),
      {
        method: event.httpMethod,
        url: normalizedPath,
        headers: Object.fromEntries(
          Object.entries(event.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v])
        ),
        socket: { remoteAddress: event.headers?.['x-nf-client-connection-ip'] || '127.0.0.1' },
      }
    );

    const chunks: Buffer[] = [];
    const responseHeaders: Record<string, string> = {};
    let statusCode = 200;

    const res = {
      statusCode: 200,
      setHeader(name: string, value: string | string[]) {
        responseHeaders[name.toLowerCase()] = Array.isArray(value) ? value.join(', ') : String(value);
      },
      getHeader(name: string) {
        return responseHeaders[name.toLowerCase()];
      },
      removeHeader(name: string) {
        delete responseHeaders[name.toLowerCase()];
      },
      writeHead(code: number, headers?: Record<string, string>) {
        statusCode = code;
        if (headers) {
          for (const [k, v] of Object.entries(headers)) {
            responseHeaders[k.toLowerCase()] = v;
          }
        }
      },
      write(chunk: Buffer | string) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        return true;
      },
      end(chunk?: Buffer | string) {
        if (chunk) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        resolve({
          statusCode: res.statusCode || statusCode,
          headers: responseHeaders,
          body: Buffer.concat(chunks).toString('utf8'),
        });
      },
    };

    app(req as unknown as express.Request, res as unknown as express.Response);
  });
}
