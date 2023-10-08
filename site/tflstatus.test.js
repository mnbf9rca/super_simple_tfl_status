/**
 * @jest-environment jsdom
 */


const axios = require('axios')
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
}));



describe('getModesFromURL', () => {
  const getModesFromURL = require('./tflstatus').getModesFromURL;

  test('should return modes from the URL when "mode" parameter is present', () => {
    const urlParams = new URLSearchParams('mode=tube,dlr');
    const result = getModesFromURL(urlParams);
    expect(result).toBe('tube,dlr'); // Modes from the URL
  });

  test('should handle spaces in the "mode" parameter and return the input', () => {
    const urlParams = new URLSearchParams('mode= tube , dlr ');
    const result = getModesFromURL(urlParams);
    expect(result).toBe('tube , dlr'); // Modes with spaces trimmed
  });

  test('should handle unexpected characters in the "mode" parameter and return the value as-is', () => {
    const urlParams = new URLSearchParams('mode=invalid_mode');
    const result = getModesFromURL(urlParams);
    expect(result).toBe('invalid_mode'); // Value as-is
  });

  test('should handle empty "mode" parameter and return default modes', () => {
    const urlParams = new URLSearchParams('mode=');
    const result = getModesFromURL(urlParams);
    expect(result).toBe('tube,elizabeth-line'); // Default modes
  });

  test('should return default modes when "mode" parameter is not in the URL', () => {
    const urlParams = new URLSearchParams('otherParam=someValue');
    const result = getModesFromURL(urlParams);
    expect(result).toBe('tube,elizabeth-line'); // Default modes
  });
  test('should return modes from the URL when "mode" parameter is present', () => {
    const urlParams = new URLSearchParams('mode=tube,dlr&otherParam=someValue');
    const result = getModesFromURL(urlParams);
    expect(result).toBe('tube,dlr'); // Modes from the URL
  });

  test('should handle spaces in the "mode" parameter and return the input string', () => {
    const urlParams = new URLSearchParams('mode= tube , dlr &otherParam=someValue');
    const result = getModesFromURL(urlParams);
    expect(result).toBe('tube , dlr'); // Modes with spaces trimmed
  });

  test('should handle unexpected characters in the "mode" parameter and return the value as-is', () => {
    const urlParams = new URLSearchParams('mode=invalid_mode&otherParam=someValue');
    const result = getModesFromURL(urlParams);
    expect(result).toBe('invalid_mode'); // Value as-is
  });

  test('should handle empty "mode" parameter and return default modes', () => {
    const urlParams = new URLSearchParams('mode=&otherParam=someValue');
    const result = getModesFromURL(urlParams);
    expect(result).toBe('tube,elizabeth-line'); // Default modes
  });

  test('should return default modes when "mode" parameter is not in the URL', () => {
    const urlParams = new URLSearchParams('otherParam=someValue');
    const result = getModesFromURL(urlParams);
    expect(result).toBe('tube,elizabeth-line'); // Default modes
  });
});

// Import the function you want to test

describe('shouldShowNames', () => {
  const shouldShowNames = require('./tflstatus').shouldShowNames;

  test('should return true when "names" parameter is "true"', () => {
    const urlParams = new URLSearchParams('names=true');
    const result = shouldShowNames(urlParams);
    expect(result).toBe(true);
  });

  test('should return false when "names" parameter is "false"', () => {
    const urlParams = new URLSearchParams('names=false');
    const result = shouldShowNames(urlParams);
    expect(result).toBe(false);
  });

  test('should return false when "names" parameter is not present', () => {
    const urlParams = new URLSearchParams();
    const result = shouldShowNames(urlParams);
    expect(result).toBe(false);
  });

  test('should return false when "names" parameter is empty', () => {
    const urlParams = new URLSearchParams('names=');
    const result = shouldShowNames(urlParams);
    expect(result).toBe(false);
  });

  test('should return false when "names" parameter has unexpected value', () => {
    const urlParams = new URLSearchParams('names=somevalue');
    const result = shouldShowNames(urlParams);
    expect(result).toBe(false);
  });
});

describe('renderStatusBlocks', () => {

  const renderStatusBlocks = require('./tflstatus').renderStatusBlocks;

  // Reset the document body before each test
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should render a single status block correctly and set --total-blocks', () => {
    const statuses = [{
      message: 'Good service on all lines',
      bgColor: '#004A9C',
    }];

    renderStatusBlocks(statuses);

    const blocks = document.querySelectorAll('.status-block');
    expect(blocks.length).toBe(1);
    expect(blocks[0].textContent).toBe('Good service on all lines');
    expect(blocks[0].style.backgroundColor).toBe('rgb(0, 74, 156)');
    
    // Validate --total-blocks CSS property
    expect(window.getComputedStyle(document.documentElement).getPropertyValue('--total-blocks')).toBe("1");
  });

  test('should render multiple status blocks correctly and set --total-blocks', () => {
    const statuses = [
      { message: 'Good service on all lines', bgColor: '#004A9C' },
      { message: 'Central', bgColor: '#E1251B' },
      { message: ' ', bgColor: '#FFFFFF' },
    ];

    renderStatusBlocks(statuses);

    const blocks = document.querySelectorAll('.status-block');
    expect(blocks.length).toBe(3);

    // Validate first block
    expect(blocks[0].textContent).toBe('Good service on all lines');
    expect(blocks[0].style.backgroundColor).toBe('rgb(0, 74, 156)');

    // Validate second block
    expect(blocks[1].textContent).toBe('Central');
    expect(blocks[1].style.backgroundColor).toBe('rgb(225, 37, 27)');

    // Validate third block
    expect(blocks[2].textContent).toBe(' ');
    expect(blocks[2].style.backgroundColor).toBe('rgb(255, 255, 255)');

    // Validate --total-blocks CSS property
    expect(window.getComputedStyle(document.documentElement).getPropertyValue('--total-blocks')).toBe("3");
  });
});




describe('fetchTfLStatus', () => {
  const fetchTfLStatus = require('./tflstatus').fetchTfLStatus;
  const lineColors = require('./tflstatus').lineColors;

  const allOkResponse = require('../test_common_tfl_results/tfl_responses_all_ok.json');
  const singleDisruptionResponse = require('../test_common_tfl_results/tfl_responses_single_disruption.json');
  const multipleDisruptionsResponse = require('../test_common_tfl_results/tfl_responses_multiple_disruptions.json');


  beforeEach(() => {
    global.fetch = jest.fn();
  });

  const createResponse = (data) => {
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      blob: () => Promise.resolve(new Blob([JSON.stringify(data)])),
      arrayBuffer: () => Promise.resolve(Buffer.from(JSON.stringify(data))),
    });
  };

  test('should return status data with no disruption and showNames=true', async () => {
    const modes = 'tube';
    const showNames = true;

    fetch.mockImplementation(() => createResponse(allOkResponse));
    const result = await fetchTfLStatus(modes, showNames);

    expect(fetch).toHaveBeenCalledWith(`https://api.tfl.gov.uk/Line/Mode/${modes}/Status`);
    expect(result).toEqual([
      {
        message: 'Good service on all lines',
        bgColor: '#004A9C',
      },
    ]);
  });

  test('should return status data with a single disruption and showNames=true', async () => {
    const modes = 'tube';
    const showNames = true;

    fetch.mockImplementation(() => createResponse(singleDisruptionResponse));
    const result = await fetchTfLStatus(modes, showNames);

    expect(fetch).toHaveBeenCalledWith(`https://api.tfl.gov.uk/Line/Mode/${modes}/Status`);
    expect(result).toEqual([
      {
        message: 'Waterloo & City',
        bgColor: '#6BCDB2',
      },
      {
        bgColor: "#004A9C",
        message: "Good service on all other lines",
      }
    ]);
  });

  test('should return status data with multiple disruptions and showNames=true', async () => {
    const modes = 'tube';
    const showNames = true;

    fetch.mockImplementation(() => createResponse(multipleDisruptionsResponse));
    const result = await fetchTfLStatus(modes, showNames);

    expect(fetch).toHaveBeenCalledWith(`https://api.tfl.gov.uk/Line/Mode/${modes}/Status`);
    expect(result).toEqual([
      {
        message: 'Central',
        bgColor: '#E1251B',
      },
      {
        message: 'Metropolitan',
        bgColor: '#870F54',
      },
      {
        message: 'Piccadilly',
        bgColor: '#000F9F',
      },
      {
        message: 'Waterloo & City',
        bgColor: '#6BCDB2',
      },
      {
        bgColor: "#004A9C",
        message: "Good service on all other lines",
      }]);
  });

  test('should return status data with no disruption and showNames=false', async () => {
    const modes = 'tube';
    const showNames = false;
  
    fetch.mockImplementation(() => createResponse(allOkResponse));
    const result = await fetchTfLStatus(modes, showNames);
  
    expect(fetch).toHaveBeenCalledWith(`https://api.tfl.gov.uk/Line/Mode/${modes}/Status`);
    expect(result).toEqual([
      {
        message: 'Good service on all lines',
        bgColor: '#004A9C',
      },
    ]);
  });
  
  test('should return status data with a single disruption and showNames=false', async () => {
    const modes = 'tube';
    const showNames = false;
  
    fetch.mockImplementation(() => createResponse(singleDisruptionResponse));
    const result = await fetchTfLStatus(modes, showNames);
  
    expect(fetch).toHaveBeenCalledWith(`https://api.tfl.gov.uk/Line/Mode/${modes}/Status`);
    expect(result).toEqual([
      {
        message: '',
        bgColor: '#6BCDB2',
      }
    ]);
  });
  
  test('should return status data with multiple disruptions and showNames=false', async () => {
    const modes = 'tube';
    const showNames = false;
  
    fetch.mockImplementation(() => createResponse(multipleDisruptionsResponse));
    const result = await fetchTfLStatus(modes, showNames);
  
    expect(fetch).toHaveBeenCalledWith(`https://api.tfl.gov.uk/Line/Mode/${modes}/Status`);
    expect(result).toEqual([
      {
        message: '',
        bgColor: '#E1251B',
      },
      {
        message: '',
        bgColor: '#870F54',
      },
      {
        message: '',
        bgColor: '#000F9F',
      },
      {
        message: '',
        bgColor: '#6BCDB2',
      }
    ]);
  });
  

});