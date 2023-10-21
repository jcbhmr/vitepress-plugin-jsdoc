<script setup>
import jsdoc from "./doc.json"
</script>

<ul>
  <template v-for="x in jsdoc.docs">
    <li v-if="x.name === x.longname">
      <a :href="x.longname.replaceAll('#', '.') + '.html'">{{ x.name }}</a>
    </li>
  </template>
</ul>
