<template>
  <div class="has-text-centered mx-5">
    <pre
      >{{ results }}
Generated using: https://autotune.diabase.app
Do not use these values without first consulting your doctor.</pre
    >
  </div>
</template>

<script>
export default {
  props: {
    results: {
      required: true,
      default: ""
    }
  }
};
</script>
