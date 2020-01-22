const { launch } = require("qawolf");
const selectors = require("../selectors/e2E");

describe('e2E', () => {
  let browser;

  beforeAll(async () => {
    browser = await launch({ url: "http://localhost:1234/" });
  });

  afterAll(() => browser.close());

  it('can click "LOAD DATA" button', async () => {
    await browser.click(selectors[0]);
  });

  it('can click "TRAIN MODEL" button', async () => {
    await browser.click(selectors[1]);
  });
});