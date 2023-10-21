<script setup>
import jsdoc from ".vitepress/jsdoc"
</script>

<ul>
  <li v-for="x in jsdoc.docs"><a :href="x.longname + '.html'">{{ x.name }}</a></li>
</ul>