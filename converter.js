/**
 * GPS Coordinate Converter Module
 * Converts between DD (Decimal Degrees), DDM (Degrees Decimal Minutes), and DMS (Degrees Minutes Seconds)
 */

const Converter = {
    // Constants
    LAT_MIN: -90,
    LAT_MAX: 90,
    LON_MIN: -180,
    LON_MAX: 180,
    
    /**
     * Parse coordinate input - handles multiple formats
     * @param {string} input - Input string like "45.4642" or "45 27.852" or "45 27 51.1"
     * @returns {number|null} Decimal degrees or null if invalid
     */
    parseCoordinate: function(input) {
        if (!input || typeof input !== 'string') return null;
        
        const trimmed = input.trim();
        if (!trimmed) return null;
        
        // Try to parse as decimal degrees (simple number)
        let match = trimmed.match(/^[-+]?(\d+\.?\d*|\d*\.\d+)$/);
        if (match) {
            return parseFloat(trimmed);
        }
        
        // Parse as DDM or DMS (space-separated values)
        const parts = trimmed.split(/[\s,]+/).filter(p => p.length > 0);
        
        if (parts.length === 2) {
            // DDM format: degrees minutes
            const degrees = parseFloat(parts[0]);
            const minutes = parseFloat(parts[1]);
            
            if (isNaN(degrees) || isNaN(minutes)) return null;
            if (minutes < 0 || minutes >= 60) return null;
            
            const sign = degrees < 0 ? -1 : 1;
            return sign * (Math.abs(degrees) + minutes / 60);
        } else if (parts.length === 3) {
            // DMS format: degrees minutes seconds
            const degrees = parseFloat(parts[0]);
            const minutes = parseFloat(parts[1]);
            const seconds = parseFloat(parts[2]);
            
            if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) return null;
            if (minutes < 0 || minutes >= 60) return null;
            if (seconds < 0 || seconds >= 60) return null;
            
            const sign = degrees < 0 ? -1 : 1;
            return sign * (Math.abs(degrees) + minutes / 60 + seconds / 3600);
        }
        
        return null;
    },
    
    /**
     * Validate latitude
     * @param {number} lat - Latitude in decimal degrees
     * @returns {boolean}
     */
    isValidLatitude: function(lat) {
        return typeof lat === 'number' && !isNaN(lat) && 
               lat >= this.LAT_MIN && lat <= this.LAT_MAX;
    },
    
    /**
     * Validate longitude
     * @param {number} lon - Longitude in decimal degrees
     * @returns {boolean}
     */
    isValidLongitude: function(lon) {
        return typeof lon === 'number' && !isNaN(lon) && 
               lon >= this.LON_MIN && lon <= this.LON_MAX;
    },
    
    /**
     * Convert decimal degrees to DDM (Degrees Decimal Minutes)
     * @param {number} dd - Decimal degrees
     * @param {number} precision - Decimal places for minutes (default: 5)
     * @returns {string} Format: "45 27.852"
     */
    ddToDDM: function(dd, precision = 5) {
        const sign = dd < 0 ? -1 : 1;
        const absDd = Math.abs(dd);
        
        const degrees = Math.floor(absDd);
        const minutes = (absDd - degrees) * 60;
        
        const result = `${sign * degrees} ${minutes.toFixed(precision)}`;
        return result;
    },
    
    /**
     * Convert decimal degrees to DMS (Degrees Minutes Seconds)
     * @param {number} dd - Decimal degrees
     * @param {number} precision - Decimal places for seconds (default: 2)
     * @returns {string} Format: "45 27 51.1"
     */
    ddToDMS: function(dd, precision = 2) {
        const sign = dd < 0 ? -1 : 1;
        const absDd = Math.abs(dd);
        
        const degrees = Math.floor(absDd);
        const minutesDecimal = (absDd - degrees) * 60;
        const minutes = Math.floor(minutesDecimal);
        const seconds = (minutesDecimal - minutes) * 60;
        
        const result = `${sign * degrees} ${minutes} ${seconds.toFixed(precision)}`;
        return result;
    },
    
    /**
     * Convert DDM to decimal degrees
     * @param {number} degrees - Degrees part
     * @param {number} minutes - Decimal minutes part
     * @returns {number} Decimal degrees
     */
    ddmToDD: function(degrees, minutes) {
        const sign = degrees < 0 ? -1 : 1;
        return sign * (Math.abs(degrees) + Math.abs(minutes) / 60);
    },
    
    /**
     * Convert DMS to decimal degrees
     * @param {number} degrees - Degrees part
     * @param {number} minutes - Minutes part
     * @param {number} seconds - Seconds part
     * @returns {number} Decimal degrees
     */
    dmsToDD: function(degrees, minutes, seconds) {
        const sign = degrees < 0 ? -1 : 1;
        return sign * (Math.abs(degrees) + Math.abs(minutes) / 60 + Math.abs(seconds) / 3600);
    },
    
    /**
     * Format DD (Decimal Degrees) for display
     * @param {number} dd - Decimal degrees
     * @param {number} precision - Decimal places (default: 4)
     * @returns {string}
     */
    formatDD: function(dd, precision = 4) {
        return dd.toFixed(precision);
    },
    
    /**
     * Main conversion function
     * @param {object} input - Input object {source: 'DD'|'DDM'|'DMS', lat: string|number, lon: string|number}
     * @returns {object|null} {dd: {lat, lon}, ddm: {lat, lon}, dms: {lat, lon}} or null if invalid
     */
    convert: function(input) {
        let latDD, lonDD;
        
        // Parse input based on source format
        if (input.source === 'DD') {
            latDD = typeof input.lat === 'number' ? input.lat : this.parseCoordinate(input.lat);
            lonDD = typeof input.lon === 'number' ? input.lon : this.parseCoordinate(input.lon);
        } else if (input.source === 'DDM') {
            const latDDM = typeof input.lat === 'string' ? this.parseCoordinate(input.lat) : input.lat;
            const lonDDM = typeof input.lon === 'string' ? this.parseCoordinate(input.lon) : input.lon;
            latDD = latDDM;
            lonDD = lonDDM;
        } else if (input.source === 'DMS') {
            const latDMS = typeof input.lat === 'string' ? this.parseCoordinate(input.lat) : input.lat;
            const lonDMS = typeof input.lon === 'string' ? this.parseCoordinate(input.lon) : input.lon;
            latDD = latDMS;
            lonDD = lonDMS;
        }
        
        // Validate
        if (!this.isValidLatitude(latDD) || !this.isValidLongitude(lonDD)) {
            return null;
        }
        
        // Convert to all formats
        return {
            dd: {
                lat: this.formatDD(latDD, 4),
                lon: this.formatDD(lonDD, 4)
            },
            ddm: {
                lat: this.ddToDDM(latDD, 5),
                lon: this.ddToDDM(lonDD, 5)
            },
            dms: {
                lat: this.ddToDMS(latDD, 2),
                lon: this.ddToDMS(lonDD, 2)
            }
        };
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Converter;
}
