const bitdb = require ('./bitdb')

const evalInContext = (js, ctx) => {
  return function() { return eval(js); }.call(ctx);
}

module.exports = {

  loadScript(txid) {
    return bitdb.findTx(txid).then(doc => {
      if (!doc) return new Error('Transaction not found.');
      const out = doc.out.find(o => o && o.b0.op === 106);
      if (!out) return new Error('Transaction not found.');

      return this.parseOutput(out)
    })
  },

  parseOutput(out) {
    const stack = [];
    let   cmd;

    Object.keys(out).forEach((k, i) => {
      // Return for first few keys
      if ( !cmd && /^[ib]/.test(k) ) return;

      // Build the command
      if (!cmd) {
        cmd = { cmd: out[k], args: [] };

      // If delimiter, push command to stack
      } else if ( out[k] === '|' || out[k] === '&' ) {
        cmd.delim = out[k];
        cmd.args = cmd.args
          .filter(_ => true)
          .filter(a => a.s)
        stack.push(cmd);
        cmd = null;

      // Build args
      } else {
        const m = k.match(/^l?(\w)(\d+)$/),
              t = m[1],
              p = m[2];

        if ( !cmd.args[p] ) cmd.args[p] = {};
        cmd.args[p][t] = out[k];
      }
      
      // If last attribute, push command to stack
      if ( i === Object.keys(out).length-1 ) {
        cmd.args = cmd.args
          .filter(_ => true)
          .filter(a => a.s)
        stack.push(cmd);
      }
    })

    return stack;
  },

  runScript(stack) {
    bitdb.findCmds(stack.map(s => s.cmd))
      .then(commands => {
        let ctx = {};
        stack.forEach(step => {
          const cmd = commands.find(c => step.cmd === c.cmd);
          if (cmd) {
            let res = evalInContext(cmd.handler, ctx).apply(null, step.args)
            ctx = step.delim === '|' ? res : {}
          }
        })
      })
  }

}
