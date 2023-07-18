// Upload executed cucumber tests to JIRA.
const { request, handler, spec } = require('pactum');
request.setDefaultTimeout(0);

const report = require('../report/report.json');

const client_id = process.env.XRAY_CLIENT_ID;
const client_secret = process.env.XRAY_CLIENT_SECRET;

const TIMEOUT_30SECONDS = 300000;

it('Get the token and upload the report', async function () {
  console.log('Uploading test execution to JIRA.. Please wait......');
  try {
    const response = await spec()
      .post('https://xray.cloud.getxray.app/api/v1/authenticate')
      .withHeaders({
        'Content-Type': 'application/json',
      })
      .withBody(
        `{"client_id": "${client_id}", "client_secret": "${client_secret}"}`
      )
      .expectStatus(200);

    const token = response.body;

    console.log('Few more seconds....');
    await spec()
      .post(`https://xray.cloud.getxray.app/api/v1/import/execution/cucumber`)
      .withHeaders('Authorization', `Bearer ${token}`)
      .withHeaders({
        'Content-Type': 'application/json',
      })
      .withBody(JSON.stringify(report));

    console.log('Done!\nUpload successfull.');
  } catch (error) {
    console.log(
      `\nAn error has occurred: ${error}. The test suite may or may not have been uploaded`
    );
  }
}).timeout(TIMEOUT_30SECONDS);
