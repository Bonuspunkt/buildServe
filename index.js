#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

const send = require('send');

const host = '127.0.0.1';
const [, , port = 8080] = process.argv;

let root;
let timeoutId;
const defaultTimeout = 60;
const queue = [];

const next = () => {
    clearTimeout(timeoutId);
    const nextAction = queue.splice(0, 1)[0];
    if (nextAction) { nextAction.fn(); }
    else { root = undefined; }
};

http.createServer((req, res) => {
    const { pathname, query = {} } = url.parse(req.url, true);
    const servePath = path.resolve(pathname);

    if (req.method === 'POST') {
        const fn = () => {
            root = servePath;
            res.writeHead(200, { 'content-type': 'text/plain' });
            res.end(servePath);
            const duration = Number(query.duration) || defaultTimeout;
            timeoutId = setTimeout(next, duration * 1e3);
        };
        if (!root) { return fn(); }
        console.log(`queued ${ servePath }`)
        return queue.push({ servePath, fn });
    }
    if (req.method === 'DELETE') {
        if (servePath === root) {
            next();
        } else {
            const index = queue.findIndex(item => item.servePath === servePath);
            if (index !== -1) { queue.splice(index, 1); }
        }
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.end(servePath);
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

}).listen(port, host);

console.log(`running at http://${ host }:${ port }`);
