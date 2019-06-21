// @ts-check
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("popsicle").fetch;
const URL = require("url").URL;
const autotuneUri = "https://run-autotune.diabase.app";

admin.initializeApp();

module.exports.autotuneCron = functions.pubsub
  .schedule("every 24 hours")
  .onRun((/*context*/) => {
    console.log("Starting Autotune Cron...");
    return admin
      .firestore()
      .collection("autotune-cron")
      .get()
      .then(snapshot => {
        console.log("Running cron for", snapshot.size, "users.");
        snapshot.docs.forEach(docSnapshot => {
          let cronJob = docSnapshot.data();
          let request = new URL(autotuneUri);

          request.searchParams.append("nsHost", cronJob.nsHost);
          request.searchParams.append(
            "min5mCarbimpact",
            cronJob.min5mCarbimpact
          );
          request.searchParams.append("startDaysAgo", cronJob.startDaysAgo);
          request.searchParams.append("profileName", "Autotune Sync");
          request.searchParams.append("updateNsProfile", "true");

          console.log("Starting Autotune:", request.toString());
          request.searchParams.append("nsSecretHash", cronJob.nsSecretHash);

          // Don't await the results. Just fire requests into the void :)
          fetch(request.toString());
        });
      });
  });
