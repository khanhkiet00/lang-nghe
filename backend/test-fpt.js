const axios = require('axios');
const FormData = require('form-data');

async function test() {
  try {
    const imageBuffer = Buffer.from('FFD8FFE000104A46494600010100000100010000FFDB004300080606070605080707070909080A0C140D0C0B0B0C1912130F141D1A1F1E1D1A1C1C20242E2720222C231C1C2837292C30313434341F27393D38323C2E333432FFDB0043010909090C0B0C180D0D1832211C2132323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232FFC00011080001000103011100021101031101FFD9', 'hex');
    const formData = new FormData();
    formData.append('image', imageBuffer, { filename: 'test.jpg' });

    const apiKey = '2rrbo6VMiK1Q2IpffKCEBO4fMdTzResX';

    console.log('Sending request...');
    const response = await axios.post('https://api.fpt.ai/vision/idr/vnm', formData, {
      headers: {
        ...formData.getHeaders(),
        'api-key': apiKey,
      }
    });

    console.log('Success:', response.data);
  } catch (err) {
    if (err.response) {
      console.log('FPT Error:', err.response.status, err.response.data);
    } else {
      console.log('Request Error:', err.message);
    }
  }
}

test();
