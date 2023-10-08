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
  'Waterloo & City': '#6BCDB2'
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

// Function to fetch TfL status
const fetchTfLStatus = async (modes, showNames) => {
  try {
    const response = await fetch(`https://api.tfl.gov.uk/Line/Mode/${modes}/Status`);
    const data = await response.json();
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

    if (allOtherLinesGood) {
      return [{
        message: 'Good service on all lines',
        bgColor: '#004A9C',
      }];
    } else {
      if (showNames) {
        disruptedLines.push({
          message: 'Good service on all other lines',
          bgColor: '#004A9C',
        });
      } 
      return disruptedLines;
    }
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
      block.style.backgroundColor = status.bgColor;
      block.textContent = status.message;
      document.body.appendChild(block);
  });
};

// Fetch status on page load and render it
const fetchAndRenderStatus = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const modes = getModesFromURL(urlParams);
  const showNames = shouldShowNames(urlParams);

  const statuses = await fetchTfLStatus(modes, showNames);
  renderStatusBlocks(statuses);
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

// Export the functions for testing
module.exports = {
  getModesFromURL,
  shouldShowNames,
  fetchTfLStatus,
  renderStatusBlocks,
};
