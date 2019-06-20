<template>
  <div class="mx-2">
    <div class="columns is-centered">
      <acHeader class="column is-two-thirds"></acHeader>
      <hr>
    </div>
    <div class="columns is-centered">
      <acForm 
      class="column is-two-thirds" 
      v-show="!isProcessing && !isComplete" 
      @onResults="handleResults"
      @onProcessing="isProcessing = true"
      ></acForm>
      <acProcessing v-if="isProcessing"></acProcessing>
      <acResults :results="results" v-if="results"></acResults>
    </div>
  </div>
</template>

<script>
import acHeader from "@/components/ac-header";
import acForm from "@/components/ac-form";
import acProcessing from "@/components/ac-processing";
import acResults from "@/components/ac-results";

export default {
  name: "home",
  components: {
    acHeader,
    acForm,
    acProcessing,
    acResults
  },
  data() {
    return {
      isProcessing: false,
      isComplete: false,
      results: undefined
    }
  },
  methods: {
    async handleResults(results) {
      this.isProcessing = false;
      this.isComplete = true;
      this.results = results;
    }
  }
};
</script>
