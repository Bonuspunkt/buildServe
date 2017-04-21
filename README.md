# buildServe

- http server w/o directory listing.
- directories that should be served, must be setup via http POST request
- multiple serve request will be queued up (response will be delayed till ready)

## run
``` bash
node index.js [port]
```

## set directory to serve
``` bash
curl -X POST /home/user/directory
```

### with custom duration
``` bash
curl -X POST /home/user/directory?duration=5 #5sec
```

## stop serving directory
``` bash
curl -X DELETE /home/user/directory
```

## notes
- only serving at 127.0.0.1
- default serve duration is 60 seconds
