/**
 * @jest-environment jsdom
 */

// tflStatus.test.js
// A simple script to display TfL status on a web page
// (c) 2023, github.com/mnbf9rca
// Available at: https://github.com/mnbf9rca/super_simple_tfl_status
// License: MIT
// version 0.1.0

// load test TfL data responses
// no disruption
const allOkResponse = require('../test_common_tfl_results/tfl_responses_all_ok.json');
// only waterloo and city line is disrupted
const singleDisruptionResponse = require('../test_common_tfl_results/tfl_responses_single_disruption.json');
// Central, Metropolitan, Piccadilly, Waterloo & City lines are disrupted
const multipleDisruptionsResponse = require('../test_common_tfl_results/tfl_responses_multiple_disruptions.json');

describe('extractMaxAge', () => {
  const { extractMaxAge } = require('./tflStatus');

  test('should return null when Cache-Control header is missing', () => {
    expect(extractMaxAge(null)).toBeNull();
    expect(extractMaxAge('')).toBeNull();
  });

  test('should return null when max-age is missing in Cache-Control header', () => {
    expect(extractMaxAge('public, must-revalidate')).toBeNull();
  });

  test('should return the correct max-age when present in Cache-Control header', () => {
    expect(extractMaxAge('public, must-revalidate, max-age=30')).toBe(30);
    expect(extractMaxAge('max-age=60, public')).toBe(60);
  });

  test('should handle spaces around equals sign in max-age directive', () => {
    expect(extractMaxAge('public, must-revalidate, max-age = 30')).toBe(30);
    expect(extractMaxAge('max-age = 60 , public')).toBe(60);
  });

  test('should handle non-integer max-age gracefully', () => {
    expect(extractMaxAge('public, max-age=30.5')).toBeNull();
    expect(extractMaxAge('public, max-age=abc')).toBeNull();
  });
});

describe('getModesFromURL', () => {
  const getModesFromURL = require('./tflStatus').getModesFromURL;

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
  test('should return modes from the URL when "mode" parameter is present with other params', () => {
    const urlParams = new URLSearchParams('mode=tube,dlr&otherParam=someValue');
    const result = getModesFromURL(urlParams);
    expect(result).toBe('tube,dlr'); // Modes from the URL
  });

  test('should handle spaces in the "mode" parameter and return the input string', () => {
    const urlParams = new URLSearchParams(
      'mode= tube , dlr &otherParam=someValue'
    );
    const result = getModesFromURL(urlParams);
    expect(result).toBe('tube , dlr'); // Modes with spaces trimmed
  });

  test('should handle unexpected characters in the "mode" parameter with other params', () => {
    const urlParams = new URLSearchParams(
      'mode=invalid_mode&otherParam=someValue'
    );
    const result = getModesFromURL(urlParams);
    expect(result).toBe('invalid_mode'); // Value as-is
  });

  test('should handle empty "mode" parameter with other params and return default modes', () => {
    const urlParams = new URLSearchParams('mode=&otherParam=someValue');
    const result = getModesFromURL(urlParams);
    expect(result).toBe('tube,elizabeth-line'); // Default modes
  });

  test('should return default modes when no "mode" parameter is provided', () => {
    const urlParams = new URLSearchParams('otherParam=someValue');
    const result = getModesFromURL(urlParams);
    expect(result).toBe('tube,elizabeth-line'); // Default modes
  });
});

describe('shouldShowNames', () => {
  const shouldShowNames = require('./tflStatus').shouldShowNames;

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
  const renderStatusBlocks = require('./tflStatus').renderStatusBlocks;

  // Reset the document body before each test
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should render a single status block correctly and set --total-blocks', () => {
    const statuses = [
      {
        message: 'Good service on all lines',
        bgColour: '#004A9C'
      }
    ];

    renderStatusBlocks(statuses);

    const blocks = document.querySelectorAll('.status-block');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].textContent).toBe('Good service on all lines');
    expect(blocks[0].style.backgroundColor).toBe('rgb(0, 74, 156)');

    // Validate --total-blocks CSS property
    expect(
      window
        .getComputedStyle(document.documentElement)
        .getPropertyValue('--total-blocks')
    ).toBe('1');
  });

  test('should render multiple status blocks correctly and set --total-blocks', () => {
    const statuses = [
      { message: 'Good service on all lines', bgColour: '#004A9C' },
      { message: 'Central', bgColour: '#E1251B', striped: false },
      { message: ' ', bgColour: '#FFFFFF', striped: false },
      { message: 'Lioness', bgColour: '#FFA600', striped: true }
    ];

    renderStatusBlocks(statuses);

    const blocks = document.querySelectorAll('.status-block');
    expect(blocks).toHaveLength(4);

    // Validate first block
    expect(blocks[0].textContent).toBe('Good service on all lines');
    expect(blocks[0].style.backgroundColor).toBe('rgb(0, 74, 156)');
    expect(blocks[0].classList.contains('striped')).toBe(false);

    // Validate second block
    expect(blocks[1].textContent).toBe('Central');
    expect(blocks[1].style.backgroundColor).toBe('rgb(225, 37, 27)');
    expect(blocks[1].classList.contains('striped')).toBe(false);

    // Validate third block
    expect(blocks[2].textContent).toBe(' ');
    expect(blocks[2].style.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(blocks[2].classList.contains('striped')).toBe(false);

    // Validate fourth block
    // should also have the striped class
    expect(blocks[3].textContent).toBe('Lioness');
    expect(blocks[3].style.backgroundColor).toBe('rgb(255, 166, 0)');
    expect(blocks[3].querySelector('.stripe')).not.toBeNull(); // striped

    // Validate --total-blocks CSS property
    expect(
      window
        .getComputedStyle(document.documentElement)
        .getPropertyValue('--total-blocks')
    ).toBe('4');
  });
});

describe('extractLineStatuses', () => {
  const extractLineStatuses = require('./tflStatus').extractLineStatuses;

  describe('when all lines are OK', () => {
    it('should return empty array for disruptedLines and allOtherLinesGood=true, with showNames=true', () => {
      const { allOtherLinesGood, disruptedLines } = extractLineStatuses(
        allOkResponse,
        true
      );
      expect(allOtherLinesGood).toBe(true);
      expect(disruptedLines).toEqual([]);
    });

    it('should return empty array for disruptedLines and allOtherLinesGood=true, with showNames=false', () => {
      const { allOtherLinesGood, disruptedLines } = extractLineStatuses(
        allOkResponse,
        false
      );
      expect(allOtherLinesGood).toBe(true);
      expect(disruptedLines).toEqual([]);
    });
  });

  describe('when a single line is disrupted', () => {
    it('should identify the disrupted line, with showNames=true', () => {
      const { allOtherLinesGood, disruptedLines } = extractLineStatuses(
        singleDisruptionResponse,
        true
      );
      expect(allOtherLinesGood).toBe(false);
      expect(disruptedLines).toEqual([
        { message: 'Waterloo & City', bgColour: '#6BCDB2', striped: false }
      ]);
    });

    it('should identify the disrupted line, with showNames=false', () => {
      const { allOtherLinesGood, disruptedLines } = extractLineStatuses(
        singleDisruptionResponse,
        false
      );
      expect(allOtherLinesGood).toBe(false);
      expect(disruptedLines).toEqual([
        { message: '', bgColour: '#6BCDB2', striped: false }
      ]);
    });
  });

  describe('when multiple lines are disrupted', () => {
    it('should identify all disrupted lines, with showNames=true', () => {
      const { allOtherLinesGood, disruptedLines } = extractLineStatuses(
        multipleDisruptionsResponse,
        true
      );
      expect(allOtherLinesGood).toBe(false);
      expect(disruptedLines).toEqual([
        { message: 'Central', bgColour: '#E1251B', striped: false },
        { message: 'Metropolitan', bgColour: '#870F54', striped: false },
        { message: 'Piccadilly', bgColour: '#000F9F', striped: false },
        { message: 'Waterloo & City', bgColour: '#6BCDB2', striped: false }
      ]);
    });

    it('should identify all disrupted lines, with showNames=false', () => {
      const { allOtherLinesGood, disruptedLines } = extractLineStatuses(
        multipleDisruptionsResponse,
        false
      );
      expect(allOtherLinesGood).toBe(false);
      expect(disruptedLines).toEqual([
        { message: '', bgColour: '#E1251B', striped: false },
        { message: '', bgColour: '#870F54', striped: false },
        { message: '', bgColour: '#000F9F', striped: false },
        { message: '', bgColour: '#6BCDB2', striped: false }
      ]);
    });
  });
});

describe('scheduleNextFetch', () => {
  const scheduleNextFetch = require('./tflStatus').scheduleNextFetch;

  beforeEach(() => {
    jest.spyOn(global, 'setTimeout');
  });

  afterEach(() => {
    global.setTimeout.mockRestore();
  });

  it('should not schedule a new fetch if maxAge is null', () => {
    scheduleNextFetch(null);
    expect(global.setTimeout).not.toHaveBeenCalled();
  });

  it('should schedule a new fetch if maxAge is a number', () => {
    const maxAge = 300; // 300 seconds
    scheduleNextFetch(maxAge);

    expect(global.setTimeout).toHaveBeenCalled();
    expect(global.setTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      maxAge * 1000
    );
  });
});

describe('setTimeout tests with fake timers', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should execute callback after 1 second', () => {
    const callback = jest.fn();
    setTimeout(callback, 1000);
    expect(callback).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should execute callback after 300 seconds based on cache_ttl', () => {
    const callback = jest.fn();
    const cache_ttl = 300;
    setTimeout(callback, cache_ttl * 1000);
    expect(callback).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('clearAndRender', () => {
  let clearAndRender;
  const mockRenderFunction = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    const tflStatus = require('./tflStatus');
    clearAndRender = tflStatus.clearAndRender;

    document.body.innerHTML = '<div class="status-block"></div>';

    mockRenderFunction.mockClear();
  });

  afterAll(() => {
    jest.resetModules();
  });

  it('should clear previous statuses', () => {
    clearAndRender([]);
    expect(document.body.innerHTML).toBe('');
  });

  it('should call renderFunction with given statuses', () => {
    const mockStatuses = [{ message: 'test', bgColour: '#fff' }];
    clearAndRender(mockStatuses, mockRenderFunction);
    expect(mockRenderFunction).toHaveBeenCalledWith(mockStatuses);
  });

  it('should clear and render the statuses correctly', () => {
    document.body.innerHTML = '<div class="old-status"></div>';
    const statuses = [{ message: 'New Status', bgColour: '#004A9C' }];

    clearAndRender(statuses);

    const oldStatuses = document.querySelectorAll('.old-status');
    const newStatuses = document.querySelectorAll('.status-block');

    expect(oldStatuses).toHaveLength(0);
    expect(newStatuses).toHaveLength(1);
    expect(newStatuses[0].textContent).toBe('New Status');
    expect(newStatuses[0].style.backgroundColor).toBe('rgb(0, 74, 156)');
  });
});

describe('fetchTfLStatus', () => {
  const fetchTfLStatus = require('./tflStatus').fetchTfLStatus;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  const createResponse = (data) => {
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {
        get: jest.fn().mockReturnValue('application/json')
      },
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      blob: () => Promise.resolve(new Blob([JSON.stringify(data)])),
      arrayBuffer: () => Promise.resolve(Buffer.from(JSON.stringify(data)))
    });
  };

  test('should return status data with no disruption and showNames=true', async () => {
    const modes = 'tube';
    const showNames = true;

    fetch.mockImplementation(() => createResponse(allOkResponse));
    const result = await fetchTfLStatus(modes, showNames);

    expect(fetch).toHaveBeenCalledWith(
      `https://api.tfl.gov.uk/Line/Mode/${modes}/Status`
    );
    expect(result).toEqual([
      {
        message: 'Good service on all lines',
        bgColour: '#004A9C'
      }
    ]);
  });

  test('should return status data with a single disruption and showNames=true', async () => {
    const modes = 'tube';
    const showNames = true;

    fetch.mockImplementation(() => createResponse(singleDisruptionResponse));
    const result = await fetchTfLStatus(modes, showNames);

    expect(fetch).toHaveBeenCalledWith(
      `https://api.tfl.gov.uk/Line/Mode/${modes}/Status`
    );
    expect(result).toEqual([
      {
        message: 'Waterloo & City',
        bgColour: '#6BCDB2',
        striped: false
      },
      {
        bgColour: '#004A9C',
        message: 'Good service on all other lines'
      }
    ]);
  });

  test('should return status data with multiple disruptions and showNames=true', async () => {
    const modes = 'tube';
    const showNames = true;

    fetch.mockImplementation(() => createResponse(multipleDisruptionsResponse));
    const result = await fetchTfLStatus(modes, showNames);

    expect(fetch).toHaveBeenCalledWith(
      `https://api.tfl.gov.uk/Line/Mode/${modes}/Status`
    );
    expect(result).toEqual([
      {
        message: 'Central',
        bgColour: '#E1251B',
        striped: false
      },
      {
        message: 'Metropolitan',
        bgColour: '#870F54',
        striped: false
      },
      {
        message: 'Piccadilly',
        bgColour: '#000F9F',
        striped: false
      },
      {
        message: 'Waterloo & City',
        bgColour: '#6BCDB2',
        striped: false
      },
      {
        bgColour: '#004A9C',
        message: 'Good service on all other lines'
      }
    ]);
  });

  test('should return status data with no disruption and showNames=false', async () => {
    const modes = 'tube';
    const showNames = false;

    fetch.mockImplementation(() => createResponse(allOkResponse));
    const result = await fetchTfLStatus(modes, showNames);

    expect(fetch).toHaveBeenCalledWith(
      `https://api.tfl.gov.uk/Line/Mode/${modes}/Status`
    );
    expect(result).toEqual([
      {
        message: 'Good service on all lines',
        bgColour: '#004A9C'
      }
    ]);
  });

  test('should return status data with a single disruption and showNames=false', async () => {
    const modes = 'tube';
    const showNames = false;

    fetch.mockImplementation(() => createResponse(singleDisruptionResponse));
    const result = await fetchTfLStatus(modes, showNames);

    expect(fetch).toHaveBeenCalledWith(
      `https://api.tfl.gov.uk/Line/Mode/${modes}/Status`
    );
    expect(result).toEqual([
      {
        message: '',
        bgColour: '#6BCDB2',
        striped: false
      }
    ]);
  });

  test('should return status data with multiple disruptions and showNames=false', async () => {
    const modes = 'tube';
    const showNames = false;

    fetch.mockImplementation(() => createResponse(multipleDisruptionsResponse));
    const result = await fetchTfLStatus(modes, showNames);

    expect(fetch).toHaveBeenCalledWith(
      `https://api.tfl.gov.uk/Line/Mode/${modes}/Status`
    );
    expect(result).toEqual([
      {
        message: '',
        bgColour: '#E1251B',
        striped: false
      },
      {
        message: '',
        bgColour: '#870F54',
        striped: false
      },
      {
        message: '',
        bgColour: '#000F9F',
        striped: false
      },
      {
        message: '',
        bgColour: '#6BCDB2',
        striped: false
      }
    ]);
  });
});

describe('isDevelopmentEnvironment', () => {
  const { isDevelopmentEnvironment } = require('./tflStatus');

  it('should return true when NODE_ENV is development', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    expect(isDevelopmentEnvironment()).toBe(true);

    // Restore original value
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should return false in non-development environments', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    expect(isDevelopmentEnvironment()).toBe(false);

    // Restore original value
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should return true for localhost hostname', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalLocation = window.location;

    process.env.NODE_ENV = 'test'; // Not development

    // Mock the entire location object
    delete window.location;
    window.location = {
      ...originalLocation,
      hostname: 'localhost'
    };

    expect(isDevelopmentEnvironment()).toBe(true);

    // Restore original values
    process.env.NODE_ENV = originalNodeEnv;
    window.location = originalLocation;
  });

  it('should return true for 127.0.0.1 hostname', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalLocation = window.location;

    process.env.NODE_ENV = 'test'; // Not development

    delete window.location;
    window.location = {
      ...originalLocation,
      hostname: '127.0.0.1'
    };

    expect(isDevelopmentEnvironment()).toBe(true);

    // Restore original values
    process.env.NODE_ENV = originalNodeEnv;
    window.location = originalLocation;
  });

  it('should return true for 0.0.0.0 hostname', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalLocation = window.location;

    process.env.NODE_ENV = 'test'; // Not development

    delete window.location;
    window.location = {
      ...originalLocation,
      hostname: '0.0.0.0'
    };

    expect(isDevelopmentEnvironment()).toBe(true);

    // Restore original values
    process.env.NODE_ENV = originalNodeEnv;
    window.location = originalLocation;
  });

  it('should return false for production hostname', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalLocation = window.location;

    process.env.NODE_ENV = 'test'; // Not development

    delete window.location;
    window.location = {
      ...originalLocation,
      hostname: 'production.example.com'
    };

    expect(isDevelopmentEnvironment()).toBe(false);

    // Restore original values
    process.env.NODE_ENV = originalNodeEnv;
    window.location = originalLocation;
  });
});

describe('printUsageInstructions', () => {
  let consoleLogMock;

  beforeAll(() => {
    // Mock console.log
    consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    // Clear mock calls between tests
    consoleLogMock.mockClear();
  });

  afterAll(() => {
    // Restore console.log to its original function
    consoleLogMock.mockRestore();
  });

  it('should print some usage instructions in development mode', () => {
    // Set NODE_ENV to development to trigger console.log
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    jest.resetModules();
    const tflStatus = require('./tflStatus');
    tflStatus.printUsageInstructions();

    expect(consoleLogMock.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(consoleLogMock).toHaveBeenNthCalledWith(
      1,
      'Super simple TfL status'
    );
    expect(consoleLogMock).toHaveBeenNthCalledWith(
      2,
      'from https://github.com/mnbf9rca/super_simple_tfl_status'
    );

    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should print usage instructions when running on localhost', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalLocation = window.location;

    process.env.NODE_ENV = 'test'; // Not development

    delete window.location;
    window.location = {
      ...originalLocation,
      hostname: 'localhost'
    };

    jest.resetModules();
    const tflStatus = require('./tflStatus');
    tflStatus.printUsageInstructions();

    expect(consoleLogMock.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(consoleLogMock).toHaveBeenNthCalledWith(
      1,
      'Super simple TfL status'
    );

    // Restore original values
    process.env.NODE_ENV = originalNodeEnv;
    window.location = originalLocation;
  });

  it('should print usage instructions when running on 127.0.0.1', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalLocation = window.location;

    process.env.NODE_ENV = 'test'; // Not development

    delete window.location;
    window.location = {
      ...originalLocation,
      hostname: '127.0.0.1'
    };

    jest.resetModules();
    const tflStatus = require('./tflStatus');
    tflStatus.printUsageInstructions();

    expect(consoleLogMock.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(consoleLogMock).toHaveBeenNthCalledWith(
      1,
      'Super simple TfL status'
    );

    // Restore original values
    process.env.NODE_ENV = originalNodeEnv;
    window.location = originalLocation;
  });

  it('should not print usage instructions in non-development mode', () => {
    // Ensure NODE_ENV is not development and not localhost
    const originalNodeEnv = process.env.NODE_ENV;
    const originalWindow = global.window;

    process.env.NODE_ENV = 'test';
    // Safely disable window to ensure no localhost detection
    global.window = undefined;

    jest.resetModules();
    const tflStatus = require('./tflStatus');
    tflStatus.printUsageInstructions();

    expect(consoleLogMock.mock.calls).toHaveLength(0);

    // Restore original values
    process.env.NODE_ENV = originalNodeEnv;
    global.window = originalWindow;
  });
});
