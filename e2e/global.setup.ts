import { test as setup } from "@playwright/test";
import { clerkSetup } from "@clerk/testing/playwright";

setup.describe.configure({ mode: "serial" });

setup("configure Clerk testing token", async () => {
  await clerkSetup();
});
