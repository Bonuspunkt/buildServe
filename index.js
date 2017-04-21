#!/usr/bin/env node
const http = require('http');
const url = require('url');

const send = require('send');

const [, , port = 8080] = process.argv;

let root;
let timeoutId;
const queue = [];

const next = () => {
    clearTimeout(timeoutId);
    const nextAction = queue.splice(0, 1)[0];
    if (nextAction) { nextAction.fn(); }
    else { root = undefined; }
};

http.createServer((req, res) => {
    const { pathname, query = {} } = url.parse(req.url, true);

    if (req.method === 'POST') {
        const fn = () => {
            root = pathname;
            res.writeHead(200, { 'content-type': 'text/plain' });
            res.end(pathname);
            const duration = Number(query.duration) || 60;
            timeoutId = setTimeout(next, duration * 1e3);
        };
        if (!root) { return fn(); }
        return queue.push({ pathname, fn });
    }
    if (req.method === 'DELETE') {
        if (pathname === root) {
            next();
        } else {
            const index = queue.findIndex(item => item.pathname === pathname);
            if (index !== -1) { queue.splice(index, 1); }
        }
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.end(pathname);
        return;
    }

    if (root) {
        return send(req, pathname, { root }).pipe(res);
    }
    if (pathname === '/') {
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.end('up&running');
        return;
    }
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not set up');
    return;

}).listen(port, '127.0.0.1');
