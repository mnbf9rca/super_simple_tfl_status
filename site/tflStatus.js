// tflStatus.js
// A simple script to display TfL status on a web page
// (c) 2023, github.com/mnbf9rca
// Available at: https://github.com/mnbf9rca/super_simple_tfl_status
// License: MIT
// version 0.1.0

// Define line colours
// https://content.tfl.gov.uk/tfl-colour-standard-issue-08.pdf
// plus new Overground line names: https://blog.tfl.gov.uk/2024/03/08/london-overground-lines/
const lineColours = {
  'Bakerloo': { 'colour': '#A65A2A', 'striped': false },
  'Central': { 'colour': '#E1251B', 'striped': false },
  'Circle': { 'colour': '#FFCD00', 'striped': false },
  'District': { 'colour': '#007934', 'striped': false },
  'Hammersmith & City': { 'colour': '#EC9BAD', 'striped': false },
  'Jubilee': { 'colour': '#7B868C', 'striped': false },
  'Metropolitan': { 'colour': '#870F54', 'striped': false },
  'Northern': { 'colour': '#000000', 'striped': false },
  'Piccadilly': { 'colour': '#000F9F', 'striped': false },
  'Victoria': { 'colour': '#00A0DF', 'striped': false },
  'Waterloo & City': { 'colour': '#6BCDB2', 'striped': false },
  'Transport for London': { 'colour': '#000F9F', 'striped': false },
  'DLR': { 'colour': '#00AFAA', 'striped': false },
  'Elizabeth line': { 'colour': '#773DBD', 'striped': false },
  'London Overground': { 'colour': '#EE7623', 'striped': false },
  'Liberty': { 'colour': '#61686B', 'striped': true },
  'Lioness': { 'colour': '#FFA600', 'striped': true },
  'Mildmay': { 'colour': '#006FE6', 'striped': true },
  'Suffragette': { 'colour': '#18A95D', 'striped': true },
  'Weaver': { 'colour': '#9B0058', 'striped': true },
  'Windrush': { 'colour': '#DC241F', 'striped': true }
};

// Create a new style element. We use this to add a stripe to the Overground status blocks
// and to add a text shadow to the status blocks so the text is more readable
const style = document.createElement('style');
style.textContent = `.status-block {
  position: relative;
  color: white;
}

.status-text {
  position: relative;
  z-index: 2; /* Text is above the stripe */
  background-color: inherit; /* Text background colour matches the block's background colour */
  padding: 0.5em;
  width: fit-content
}

.stripe {
  content: "";
  position: absolute;
  top: 33.33%; /* Position the stripe in the middle */
  left: 0;
  height: 33.33%; /* Stripe takes up 1/3 of the block height */
  width: 100%; /* Stripe spans the entire width of the block */
  background-color: white; /* Stripe colour */
  z-index: 1; /* Stripe is below the text */
}`;

// Function to initialize styles
const initStyles = () => {
  document.head.appendChild(style);
};


// Function to extract max-age from Cache-Control header
const extractMaxAge = (cacheControlHeader) => {
  if (!cacheControlHeader) return null;

  const maxAgeMatch = cacheControlHeader.match(/max-age\s*=\s*([\d.]+)/);

  if (maxAgeMatch && maxAgeMatch[1]) {
    const value = maxAgeMatch[1];
    if (!Number.isInteger(parseFloat(value))) {
      return null;
    }
    return parseInt(value, 10);
  }

  return null;
};


// Function to get modes from URL
const getModesFromURL = (urlParams) => {
  const mode = urlParams.get('mode');
  return mode ? mode.trim() : 'tube,elizabeth-line';
};

// Function to check if names should be shown
const shouldShowNames = (urlParams) => {
  return urlParams.get('names') === 'true';
};

// Function to extract line statuses
const extractLineStatuses = (data, showNames) => {
  let allOtherLinesGood = true;
  const disruptedLines = [];

  data.forEach(line => {
    const hasDisruption = line.lineStatuses.some(status => status.statusSeverity < 10);
    if (hasDisruption) {
      allOtherLinesGood = false;
      disruptedLines.push({
        message: showNames ? line.name : '',
        bgColour: lineColours[line.name].colour || '#000',
        striped: lineColours[line.name].striped
      });
    }
  });

  return { allOtherLinesGood, disruptedLines };
};

// Function to schedule next fetch
const scheduleNextFetch = (maxAge) => {
  if (maxAge !== null) {
    setTimeout(() => fetchAndRenderStatus(), maxAge * 1000);
  }
};

// Function to clear and render new statuses
// we allow passing a render function for testing
const clearAndRender = (statuses, renderFunction = renderStatusBlocks) => {
  // Clear previous statuses
  document.body.innerHTML = '';
  // Render new statuses
  renderFunction(statuses);
};

// Function to fetch TfL status
const fetchTfLStatus = async (modes, showNames) => {
  try {
    const response = await fetch(`https://api.tfl.gov.uk/Line/Mode/${modes}/Status`);
    const maxAge = extractMaxAge(response.headers.get('Cache-Control'));
    const data = await response.json();

    const { allOtherLinesGood, disruptedLines } = extractLineStatuses(data, showNames);
    const statuses = allOtherLinesGood
      ? [{ message: 'Good service on all lines', bgColour: '#004A9C' }]
      : disruptedLines.concat(showNames ? [{ message: 'Good service on all other lines', bgColour: '#004A9C' }] : []);

    clearAndRender(statuses);
    scheduleNextFetch(maxAge);

    return statuses;
  } catch (err) {
    console.error('Failed to fetch TfL status:', err);
    return [];
  }
};

// Function to render status blocks
const renderStatusBlocks = (statuses) => {
  document.documentElement.style.setProperty('--total-blocks', statuses.length);
  statuses.forEach(status => {
    const block = document.createElement('div');
    block.className = 'status-block';
    block.style.backgroundColor = status.bgColour;

    const text = document.createElement('div');
    text.className = 'status-text';
    text.textContent = status.message;
    block.appendChild(text);

    if (status.striped) {
      const stripe = document.createElement('div');
      stripe.className = 'stripe';
      block.appendChild(stripe);
    }

    document.body.appendChild(block);
  });
};

// Function to fetch and render status
const fetchAndRenderStatus = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const modes = getModesFromURL(urlParams);
  const showNames = shouldShowNames(urlParams);

  await fetchTfLStatus(modes, showNames);
};



// Cache Time To Live in seconds (for example, 300 seconds or 5 minutes)
const cache_ttl = 300;

// Function to schedule cache refresh
const scheduleCacheRefresh = () => {
  setTimeout(() => {
    // Clear previous statuses
    document.body.innerHTML = '';
    // Fetch and render new statuses
    fetchAndRenderStatus();
  }, cache_ttl * 1000);
};

const printUsageInstructions = () => {
  // Print usage instructions only in debug mode
  // Check for development environment with browser-safe fallback
  const isDevelopment = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') ||
                       (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost');

  if (isDevelopment) {
    console.log('Super simple TfL status');
    console.log('from https://github.com/mnbf9rca/super_simple_tfl_status')
    console.log('Usage Instructions:');
    console.log('1. mode: The mode of transportation. Default is "tube,elizabeth-line". Recommended list of modes: tube,elizabeth-line,dlr,overground.');
    console.log('   You can put any value here - it will be passed to TfL API which may return an error (check console).');
    console.log('   Example: ?mode=tube');
    console.log('2. names: Whether to show names of the lines. Default is false.');
    console.log('   Example: ?names=true');
    console.log('3. of course, you can combine them.');
    console.log('   Example: ?names=true&mode=tube,elizabeth-line');
  }
};

// Initialize the application
const init = () => {
  initStyles();
  printUsageInstructions();
  fetchAndRenderStatus();
  scheduleCacheRefresh();
};

// Auto-initialize if in browser environment (not in tests)
if (
  typeof window !== 'undefined' &&
  typeof document !== 'undefined' &&
  !(typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test')
) {
  init();
}

// Export the functions for testing
if (typeof module !== 'undefined') {
  module.exports = {
    extractMaxAge,
    getModesFromURL,
    shouldShowNames,
    extractLineStatuses,
    scheduleNextFetch,
    clearAndRender,
    fetchTfLStatus,
    renderStatusBlocks,
    setTimeout,
    printUsageInstructions,
    init,
    initStyles,
    scheduleCacheRefresh,
    lineColours
  };
}