<script setup>
import jsdoc from "vitepress-plugin-jsdoc/doc.json"
</script>

# {{ $params.longname }} <Badge type="info" :text="$params.kind" />

{{ $params.description }}

{{ $params.meta?.filename }}
