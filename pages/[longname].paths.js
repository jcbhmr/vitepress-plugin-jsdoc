import jsdoc from "./doc.json"

export default {
    paths() {
        //   return [
        //     { params: { pkg: 'foo' }},
        //     { params: { pkg: 'bar' }}
        //   ]
        return jsdoc.docs.filter(x => x.kind !== "package").map(x => ({ params: x }))
    }
  }