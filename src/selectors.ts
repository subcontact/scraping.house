export default {
  login: {
    username: '//*[@id="session_key"]',
    password: '//*[@id="session_password"]',
    submit: '//button[contains(@class,"sign-in-form__submit-button")]',
  },
  user: {
    profile: {
      base: {
        fullName: "//div[contains(@class,'pv-text-details__left-panel')][1]/div[1]/h1",
        shortDesc: "//div[contains(@class,'pv-text-details__left-panel')][1]/div[2]",
        location: "//div[contains(@class,'pv-text-details__left-panel')][2]/span[1]",
        contactInfoButton: "//div[contains(@class,'pv-text-details__left-panel')][2]/span[2]",
        info: "//section[contains(@class,'pv-about-section')]/div",
        infoTextToDelete: "//section[contains(@class,'pv-about-section')]/div/span",
        premiumBadge: "//li-icon[@type='linkedin-bug']",
        influencerBadge: "//li-icon[@type='linkedin-influencer-color-icon']",
      },
    },
  },
};
