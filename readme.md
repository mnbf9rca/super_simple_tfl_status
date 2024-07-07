# Super Simple TfL Status 🚇

## Overview

Get real-time TfL (Transport for London) service status in a straightforward and minimalist design. No more fumbling through apps or web pages to know if your line is running smoothly. Built with pure JavaScript (ok, a tiny bit of CSS to allow the new [Overground line colours](https://madeby.tfl.gov.uk/2024/02/15/overground_line_names/) to be striped), and calling the [TfL API](https://api-portal.tfl.gov.uk/api-details#api=Line&operation=Line_StatusByModeByPathModesQueryDetailQuerySeverityLevel) directly, this lightweight tool can be easily integrated into your workflow or dashboard.

![TfL Status Example with and without names](img/browsers.png)

## Live Demos 🚀

Experience Super Simple TfL Status in action with these quick demo links, or embed these pages in your home automation dashboard.

| Description                   | Live Link |
|-------------------------------|-----------|
| **Tube Only**                 | [🚇 Tube](https://tfl-status.cynexia.com/?mode=tube) |
| **Elizabeth Line Only**       | [🚆 Elizabeth Line](https://tfl-status.cynexia.com/?mode=elizabeth-line) |
| **Tube + Elizabeth Line**     | [🚇🚆 Combo 1](https://tfl-status.cynexia.com/?mode=tube,elizabeth-line) |
| **Tube + Overground**         | [🚇🚞 Combo 2](https://tfl-status.cynexia.com/?mode=tube,overground) |
| **All Modes**                 | [🌐 All Modes](https://tfl-status.cynexia.com/?mode=tube,elizabeth-line,overground) |
| **All Modes + Names**         | [🌐 All Modes + Names](https://tfl-status.cynexia.com/?mode=tube,elizabeth-line,overground&names=true) |

Click on the live links to explore different configurations and find the one that suits you the best!

## Features

- 🚀 **Fast**: Fetches and displays statuses in seconds
- 🎨 **Colour-Coded**: Uses official TfL line colours for quick identification
- 🔍 **Configurable**: Choose which modes of transport to display
- 🛠 **Simple Codebase**: Easy to extend or modify

## Quick Start

### Pre-requisites

- A modern web browser
- Internet connection

### Usage

You can use the hosted version at https://tfl-status.cynexia.com or run your own:

1. Clone the repository: `git clone https://github.com/mnbf9rca/super_simple_tfl_status.git`
2. Open `index.html` in your web browser.

#### URL Parameters

- `mode`: Choose the mode of transportation. Default is "tube,elizabeth-line". Example: `?mode=tube,dlr`. Options are any accepted by the TfL API, although some, like `bus` are obviously less useful. You can see all available options by [using the TfL API Portal](https://api-portal.tfl.gov.uk/api-details#api=Line&operation=Line_MetaModes) to query for 'all valid modes'.
- `names`: Display the names of the lines. Default is false. Example: `?names=true`. See below for more info.

Combine parameters like this: `?mode=tube&names=true`

## Display Options 🎨

Understand how the `names` parameter changes the display when there are disruptions or no disruptions:

| Scenario                 | `names=true`                      | `names=false`                     |
|--------------------------|-----------------------------------|----------------------------------|
| **No Disruptions**       | Shows "Good service on all lines". | Shows "Good service on all lines". |
| **Some Disruptions**     | Shows disrupted lines with their names, followed by "Good service on all other lines."| Shows only the colours of disrupted lines.  |
| **All Lines Disrupted**  | Shows all lines with disruptions and their names. | Shows only the colours of all disrupted lines. |

## Contributing

Feel free to open issues or submit pull requests. Every contribution is welcome!

## License

This project is licensed under the MIT License. TfL API subject to TfL's terms.
