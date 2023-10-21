# {{ $params.name }}

<small>{{ $params.kind }}</small>

{{ $params.meta?.filename }}

{{ $params.description }}

<div v-for="x in $params.params">

- <code>{{ x.name }}</code>: {{ x.type.names.join(" | ") }}

</div>

<details><summary>JSDoc comment</summary>

<pre>{{ $params.comment }}</pre>

</details>