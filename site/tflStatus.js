// tflStatus.js
// A simple script to display TfL status on a web page
// (c) 2023, github.com/mnbf9rca
// Available at: https://github.com/mnbf9rca/super_simple_tfl_status
// License: MIT
// version 0.1.0

// Define line colors
// https://content.tfl.gov.uk/tfl-colour-standard-issue-08.pdf
const lineColors = {
  'Bakerloo': '#A65A2A',
  'Central': '#E1251B',
  'Circle': '#FFCD00',
  'District': '#007934',
  'Hammersmith & City': '#EC9BAD',
  'Jubilee': '#7B868C',
  'Metropolitan': '#870F54',
  'Northern': '#000000',
  'Piccadilly': '#000F9F',
  'Victoria': '#00A0DF',
  'Waterloo & City': '#6BCDB2',
  'Transport for London': '#000F9F',
  'DLR': '#00AFAA',
  'Elizabeth line': '#773DBD',
  'London Overground': '#EE7623',
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
        bgColor: lineColors[line.name] || '#000',
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
      ? [{ message: 'Good service on all lines', bgColor: '#004A9C' }]
      : disruptedLines.concat(showNames ? [{ message: 'Good service on all other lines', bgColor: '#004A9C' }] : []);

    clearAndRender(statuses);
    scheduleNextFetch(maxAge);

    return statuses;
  } catch (err) {
    console.error('Failed to fetch TfL status:', err);
    return [];
  }
};

// Function to render status blocks
let renderStatusBlocks = (statuses) => {
  document.documentElement.style.setProperty('--total-blocks', statuses.length);
  statuses.forEach(status => {
    const block = document.createElement('div');
    block.className = 'status-block';
    block.style.backgroundColor = status.bgColor;
    block.textContent = status.message;
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

// Initially fetch and render the status
fetchAndRenderStatus();

// Cache Time To Live in seconds (for example, 300 seconds or 5 minutes)
const cache_ttl = 300;

// Reload the status when cache_ttl expires
setTimeout(() => {
  // Clear previous statuses
  document.body.innerHTML = '';
  // Fetch and render new statuses
  fetchAndRenderStatus();
}, cache_ttl * 1000);

const printUsageInstructions = () => {
    // Print usage instructions
    console.log('Super simple TfL status');
    console.log('from https://github.com/mnbf9rca/super_simple_tfl_status')
    console.log('Usage Instructions:');
    console.log('1. mode: The mode of transportation. Default is "tube,elizabeth-line".');
    console.log('   Example: ?mode=tube');
    console.log('2. names: Whether to show names of the lines. Default is false.');
    console.log('   Example: ?names=true');
    console.log('3. of course, you can combine them.');
    console.log('   Example: ?names=true&mode=tube,elizabeth-line');
};

// Call the function
printUsageInstructions();


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
  };
}