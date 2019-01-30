const axios = require('axios')

const client = axios.create({
  baseURL: 'https://babel.bitdb.network/q/1DHDifPvtPgKFPZMRSxmVHhiPvFmxZwbfh/'
})

if (typeof btoa !== 'function') {
  function btoa(str) {
    return Buffer.from(str.toString(), 'binary')
      .toString('base64');
  }
}

const bitdb = {
  client,

  _key: null,

  get key() {
    return this._key;
  },

  set key(val) {
    this._key = val;
    this.client.defaults.headers.common.key = val;
  },

  findCmdQuery(cmds) {
    return {
      "v": 3,
      "q": {
        "find": {
          "in.e.a": { "$in": cmds },
          "out.s1": "$",
          "out.s5": "handler"
        },
        "limit": cmds.length
      },
      "r": {
        "f": "[.[] | {cmd: .in[0].e.a, handler: .out[0].s3}]"
      }
    }
  },

  findCmds(keys) {
    const query = this.findCmdQuery(keys),
          path  = btoa(JSON.stringify(query));

    return this.client.get( path ).then(r => {
      return r.data.u.concat(r.data.c);
    });
  },

  findCmd(key) {
    return this.findCmds([key]).then(cmds => cmds[0])
  },

  findTxQuery(txids) {
    return {
      'v': 3,
      'q': {
        'find': {
          'tx.h': { '$in': txids }
        },
        'limit': txids.length
      }
    }
  },

  findTxs(txids) {
    const query = this.findTxQuery(txids),
          path  = btoa(JSON.stringify(query));

    return this.client.get( path ).then(r => {
      return r.data.u.concat(r.data.c);
    });
  },

  findTx(txid) {
    return this.findTxs([txid]).then(txs => txs[0])
  }
}

// Set bitdb key
bitdb.key = '1HP4FTex7eWL3YUQoM1aJQfZ2rmbrsHUoe'

module.exports = bitdb;