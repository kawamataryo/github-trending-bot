import { createTweetText } from "../../functions/src/lib/twitter";

describe("createTweetText", () => {
  it("truncate ", () => {
    const trend = {
      owner: "kawamataryo",
      repository: "test-repository",
      language: "typescript",
      description: "Ultricies vulputate sodales interdum potenti tempor euismod convallis eget"
        + "nunc,torquent dictumst rutrum phasellus sem in urna cum. Vitae lacus pharetra neque"
        + "cursus ultricies porta, viverra felis bibendum penatibus massa",
      starCount: "10,000",
      forkCount: "1,000",
      todayStarCount: "100",
      ownersTwitterAccount: "@KawamataRyo",
      url: "https://t.co/NawXaDqsLJ?amp=1"
    }

    expect(createTweetText(trend).length < 140).toBeTruthy()
  })
})
