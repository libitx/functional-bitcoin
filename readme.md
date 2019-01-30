# Functional Bitcoin 🤯

Playing with \_unwriter's ideas of decentralized [Bitcoin application protocols](https://bitcom.bitdb.network/), and chaining small single purpose "functions" together to form an extensible protocol.


## Step 1 - Embed some small JavaScript functions into the blockchain

I have used the Bitcom protocol to register protocols and embed handler functions attached to those protocols.

* [See functions](https://babel.bitdb.network/query/1DHDifPvtPgKFPZMRSxmVHhiPvFmxZwbfh/ewogICJ2IjogMywKICAicSI6IHsKICAgICJmaW5kIjogewogICAgICAiaW4uZS5hIjogewogICAgICAgICIkaW4iOiBbCiAgICAgICAgICAiMWpUNEdkM2ZvRHE2Q1oxVHlucDM4QU1ETkI2OVBEcXRzIiwKICAgICAgICAgICIxNzh1U1RGc3JBWkx6aW00eTVtNUc3WXBRM2hTUWNrUmlUIiwKICAgICAgICAgICIxOFN1Q0FYaVRnY3E1V2o3SjkxSlNrS2hycVExNnFQUXhXIgogICAgICAgIF0KICAgICAgfSwKICAgICAgIm91dC5zMSI6ICIkIiwKICAgICAgIm91dC5zNSI6ICJoYW5kbGVyIgogICAgfSwKICAgICJsaW1pdCI6IDYKICB9LAogICJyIjogewogICAgImYiOiAiWy5bXSB8IHtjbWQ6IC5pblswXS5lLmEsIGhhbmRsZXI6IC5vdXRbMF0uczN9XSIKICB9Cn0=)

The JavaScript is pretty minimal, but this explains the functions a little clearer:

```javascript
// ref: 1jT4Gd3foDq6CZ1Tynp38AMDNB69PDqts
// name: simple_meta
// desc: takes an array of arguments and maps together into a key, value object

(...args) => {
  return args.reduce((h, a, i) => {
    if (i % 2 === 0) h[a.s] = args[i + 1].s;
    return h;
  }, {})
}


// ref: 178uSTFsrAZLzim4y5m5G7YpQ3hSQckRiT
// name: extend_object
// desc: recieves a previous output, and merges with a new key, value object mapped from an array of arguments

(...args) => {
  return {
    ...this,
    ...args.reduce((h, a, i) => {
      if (i % 2 === 0) h[a.s] = args[i + 1].s;
      return h;
    }, {})
  }
}


// ref: 18SuCAXiTgcq5Wj7J91JSkKhrqQ16qPQxW
// name: echo
// desc: recieves a previous output, and prints it out

_ => {
  console.log(this)
}
```


## Step 2 - Create a transaction writing some data to the blockchain and chaining each of the functions above

Using \_unwriter's pipe methodology [discussed here](https://github.com/unwriter/Bitcom/issues/2), I created the following transaction:

* [See transaction](https://babel.bitdb.network/query/1DHDifPvtPgKFPZMRSxmVHhiPvFmxZwbfh/ewogICJ2IjogMywKICAicSI6IHsKICAgICJmaW5kIjogewogICAgICAidHguaCI6ICJiZTg4MWQ3OWQyODMxZTZhZjE5NzVlNjU3OGQxYThjOTE3YjFlY2UwODkzNzE1YTcxYWRiNjU2ZTg4NzdjOGU2IgogICAgfSwKICAgICJsaW1pdCI6IDEKICB9Cn0=)

Simplified this translates as:

```
OP_RETURN
  1jT4Gd3foDq6CZ1Tynp38AMDNB69PDqts foo 1 bar 2 baz 3 |   // simple_meta
  178uSTFsrAZLzim4y5m5G7YpQ3hSQckRiT baz 66 qux 99 |      // merge_object
  18SuCAXiTgcq5Wj7J91JSkKhrqQ16qPQxW                      // echo
```


## Step 3 - Write some code that parses this transaction and executes it

I've used bitdb for this, and the process happens in two steps:

1. First the initiating transaction is parsed and turned into a "stack" of function references and arguments, and then the function tranactions are fetched in one query so we have all the functions ready.
2. Then we iterate through the stack of functions one by one, passing the output of the previous command as the "this" context of each subsequent function (which allows the chaining).

```javascript
const scriptRunner = require('./src/script-runner')
scriptRunner.loadScript('be881d79d2831e6af1975e6578d1a8c917b1ece0893715a71adb656e8877c8e6')
  .then(stack => scriptRunner.runScript(stack))

// => outputs { foo: '1', bar: '2' baz: '66', qux: '99' }
```

This is pretty simple example, and there aren't many reason's you'd want to do this over the blockchain just to output something to your console. But these functions can be anything... the result could be put back on the blockchain as a new transaction, or posted on Twitter, or sends an SMS, or turns your home themometer up.

