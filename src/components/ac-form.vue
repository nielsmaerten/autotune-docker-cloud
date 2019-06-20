<template>
  <form @submit="submit">
    <article class="message is-warning is-small">
      <div class="message-header">
        <p>Warning!</p>
      </div>
      <div class="message-body">
        This site is an experiment, and only provided for reference and learning
        purposes. You should never rely on it to make medical decisions. Talk to
        your doctor!
        <div class="field mt-4">
          <label class="checkbox">
            <input type="checkbox" v-model="acceptedDisclaimer" />
            I understand
          </label>
        </div>
      </div>
    </article>
    <div class="field">
      <label class="label">Nightscout site</label>
      <div class="control">
        <input v-model="nsHost" class="input" type="text" />
      </div>
      <p class="help is-danger" v-show="!isValidUrl">
        Are you sure this URL is correct?
      </p>
    </div>

    <div class="field">
      <label class="label">
        Nightscout secret
        <span v-show="!updateNsProfile">(optional)</span>
      </label>
      <div class="control">
        <input
          class="input"
          v-model="nsSecret"
          type="password"
          placeholder="••••"
          :required="updateNsProfile"
        />
      </div>
      <p class="help is-info" v-show="updateNsProfile">
        Required if profile needs to be auto-updated.
      </p>
    </div>

    <div class="field">
      <label class="label">Min. 5 minute carb impact</label>
      <div class="control">
        <input v-model="min5mCarbimpact" class="input" type="number" />
      </div>
      <p class="help is-success"></p>
    </div>

    <div class="field">
      <label class="label">Days to process</label>
      <div class="control">
        <input v-model="startDaysAgo" required class="input" type="number" />
      </div>
      <p class="help is-success"></p>
    </div>

    <div class="field">
      <label class="checkbox">
        <input type="checkbox" v-model="categorizeUamAsBasal" />
        Categorize UAM as basal
      </label>
    </div>

    <!-- <div class="field">
      <label class="label">Timezone</label>
      <div class="control">
        <input disabled class="input" type="number">
      </div>
      <p class="help is-info">Timezone will be read from Nightscout profile. Make sure it's correct!</p>
    </div>-->

    <div class="field">
      <label class="label">Profile name</label>
      <div class="control">
        <input
          class="input"
          :disabled="updateNsProfile"
          required
          type="text"
          v-model="profileName"
        />
      </div>
      <p class="help is-success"></p>
    </div>

    <article class="message is-info is-small" v-show="updateNsProfile">
      <div class="message-header">
        <p>Auto updating Nightscout</p>
      </div>
      <div class="message-body">
        Autotune Cloud will only update a profile with the name 'Autotune Sync'.
        If your Nightscout site does not yet have a profile with that name,
        create one by duplicating your existing profile and renaming it.
        <br />This is enforced so that you'll always have a backup of your
        original profile that won't be overwritten.
      </div>
    </article>

    <div class="field">
      <label class="checkbox">
        <input type="checkbox" v-model="updateNsProfile" />
        Auto-update Nightscout site with results
      </label>
    </div>

    <div class="field">
      <button class="button is-primary" :disabled="!isFormValid" type="submit">
        Run Autotune
      </button>
    </div>
  </form>
</template>

<script>
const jsSHA = require("jssha");
const syncProfileName = "Autotune Sync";
const autotuneUri = "https://run-autotune.diabase.app/";
export default {
  data() {
    return {
      min5mCarbimpact: 8,
      nsHost: "https://my-nightscout.example.com",
      updateNsProfile: false,
      profileName: "Default",
      nsSecret: "",
      acceptedDisclaimer: false,
      startDaysAgo: 30,
      categorizeUamAsBasal: false
    };
  },
  methods: {
    async submit(e) {
      e.preventDefault();
      let request = new URL(autotuneUri);
      request.searchParams.append("nsHost", this.nsHost);
      request.searchParams.append("min5mCarbimpact", this.min5mCarbimpact);
      request.searchParams.append("startDaysAgo", this.startDaysAgo);
      request.searchParams.append("profileName", this.profileName);
      request.searchParams.append(
        "categorizeUamAsBasal",
        this.categorizeUamAsBasal
      );
      if (this.nsSecret.length > 0) {
        request.searchParams.append("nsSecretHash", this.nsSecretHash);
        if (this.updateNsProfile) {
          request.searchParams.append("updateNsProfile", this.updateNsProfile);
        }
      }

      this.$emit("onProcessing");
      let response = await fetch(request);

      let results = await response.text();
      if (response.status !== 200) {
        this.$emit(
          "onResults",
          "Sorry, something went wrong. Details: " + results
        );
      } else {
        this.$emit("onResults", results);
      }
    }
  },
  computed: {
    isValidUrl() {
      let regexp = /\b((http|https):\/\/?)[^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\s]|\/?))/;
      return regexp.test(this.nsHost);
    },
    isFormValid() {
      return (
        this.acceptedDisclaimer &&
        this.nsHost.length > 0 &&
        this.min5mCarbimpact > 0 &&
        this.profileName.length > 0
      );
    },
    nsSecretHash() {
      var shaObj = new jsSHA("SHA-1", "TEXT");
      shaObj.update(this.nsSecret);
      return shaObj.getHash("HEX");
    }
  },
  watch: {
    updateNsProfile(updateEnabled) {
      if (updateEnabled) {
        this.profileName = syncProfileName;
      }
    }
  }
};
</script>
