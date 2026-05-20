# GPSuzuki - GPS Angle Converter

A privacy-focused Wep app for converting GPS coordinate angles between different formats.

## Features

- ✓ **DD to DDM**: Convert Decimal Degrees to Degrees and Decimal Minutes
- ✓ **DMS to DDM**: Convert Degrees Minutes Seconds to Degrees and Decimal Minutes
- ✓ **Input Validation**: Comprehensive validation with helpful error messages
- ✓ **Copy to Clipboard**: Easily copy results
- ✓ **Privacy-First**: No data collection, no Google Services required
- ✓ **Volla OS 15 Compatible**: Works on all AOSP-based systems

## Supported Formats

| Format | Example | Description |
|--------|---------|-------------|
| **DD** | 48.5536° | Decimal Degrees (standard GPS format) |
| **DDM** | 48° 33.216' | Degrees and Decimal Minutes |
| **DMS** | 48° 33' 12.96" | Degrees Minutes Seconds |

## Installation on Debian 13

Run ./dev-server.sh and open a browser to http://localhost:8000

### Prerequisites

None

```bash
sudo apt install flutter dart default-jdk
