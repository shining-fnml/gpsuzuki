/**
 * GPS Suzuki PWA - Application Controller
 * Manages UI interactions and conversions
 */

const App = {
    // DOM Elements
    elements: {},
    
    // Initialize the application
    init: function() {
        this.cacheDOMElements();
        this.attachEventListeners();
        this.monitorNetworkStatus();
    },
    
    /**
     * Cache frequently used DOM elements
     */
    cacheDOMElements: function() {
        this.elements = {
            // Input fields
            ddLat: document.getElementById('ddLat'),
            ddLon: document.getElementById('ddLon'),
            ddmLat: document.getElementById('ddmLat'),
            ddmLon: document.getElementById('ddmLon'),
            dmsLat: document.getElementById('dmsLat'),
            dmsLon: document.getElementById('dmsLon'),
            
            // Output fields
            outDDLat: document.getElementById('outDDLat'),
            outDDLon: document.getElementById('outDDLon'),
            outDDMLat: document.getElementById('outDDMLat'),
            outDDMLon: document.getElementById('outDDMLon'),
            outDMSLat: document.getElementById('outDMSLat'),
            outDMSLon: document.getElementById('outDMSLon'),
            
            // Buttons
            convertBtn: document.getElementById('convertBtn'),
            clearBtn: document.getElementById('clearBtn'),
            
            // Status
            onlineStatus: document.getElementById('onlineStatus'),
            errorMsg: document.getElementById('errorMsg')
        };
    },
    
    /**
     * Attach event listeners
     */
    attachEventListeners: function() {
        // Convert button
        this.elements.convertBtn.addEventListener('click', () => this.handleConvert());
        
        // Clear button
        this.elements.clearBtn.addEventListener('click', () => this.handleClear());
        
        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCopy(e));
        });
        
        // Enter key in inputs
        const inputFields = [
            this.elements.ddLat, this.elements.ddLon,
            this.elements.ddmLat, this.elements.ddmLon,
            this.elements.dmsLat, this.elements.dmsLon
        ];
        
        inputFields.forEach(field => {
            field.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleConvert();
            });
        });
    },
    
    /**
     * Get the active input format and values
     * @returns {object|null} {source, lat, lon} or null
     */
    getActiveInput: function() {
        // Check DD inputs first
        if (this.elements.ddLat.value.trim() || this.elements.ddLon.value.trim()) {
            return {
                source: 'DD',
                lat: this.elements.ddLat.value.trim(),
                lon: this.elements.ddLon.value.trim()
            };
        }
        
        // Check DDM inputs
        if (this.elements.ddmLat.value.trim() || this.elements.ddmLon.value.trim()) {
            return {
                source: 'DDM',
                lat: this.elements.ddmLat.value.trim(),
                lon: this.elements.ddmLon.value.trim()
            };
        }
        
        // Check DMS inputs
        if (this.elements.dmsLat.value.trim() || this.elements.dmsLon.value.trim()) {
            return {
                source: 'DMS',
                lat: this.elements.dmsLat.value.trim(),
                lon: this.elements.dmsLon.value.trim()
            };
        }
        
        return null;
    },
    
    /**
     * Clear error message
     */
    clearError: function() {
        this.elements.errorMsg.style.display = 'none';
        this.elements.errorMsg.textContent = '';
    },
    
    /**
     * Show error message
     * @param {string} message
     */
    showError: function(message) {
        this.elements.errorMsg.textContent = message;
        this.elements.errorMsg.style.display = 'block';
    },
    
    /**
     * Handle conversion button click
     */
    handleConvert: function() {
        this.clearError();
        
        const input = this.getActiveInput();
        
        if (!input) {
            this.showError('❌ Errore: inserisci le coordinate in almeno uno dei tre formati');
            this.clearOutputs();
            return;
        }
        
        if (!input.lat || !input.lon) {
            this.showError('❌ Errore: inserisci sia latitudine che longitudine');
            this.clearOutputs();
            return;
        }
        
        const result = Converter.convert(input);
        
        if (!result) {
            this.showError('❌ Errore: coordinate non valide. Verifica i valori e i formati.');
            this.clearOutputs();
            return;
        }
        
        this.displayResults(result);
    },
    
    /**
     * Display conversion results
     * @param {object} result - Conversion result
     */
    displayResults: function(result) {
        // DD
        this.elements.outDDLat.textContent = result.dd.lat;
        this.elements.outDDLon.textContent = result.dd.lon;
        
        // DDM
        this.elements.outDDMLat.textContent = result.ddm.lat;
        this.elements.outDDMLon.textContent = result.ddm.lon;
        
        // DMS
        this.elements.outDMSLat.textContent = result.dms.lat;
        this.elements.outDMSLon.textContent = result.dms.lon;
    },
    
    /**
     * Clear all outputs
     */
    clearOutputs: function() {
        this.elements.outDDLat.textContent = '-';
        this.elements.outDDLon.textContent = '-';
        this.elements.outDDMLat.textContent = '-';
        this.elements.outDDMLon.textContent = '-';
        this.elements.outDMSLat.textContent = '-';
        this.elements.outDMSLon.textContent = '-';
    },
    
    /**
     * Handle clear button click
     */
    handleClear: function() {
        this.elements.ddLat.value = '';
        this.elements.ddLon.value = '';
        this.elements.ddmLat.value = '';
        this.elements.ddmLon.value = '';
        this.elements.dmsLat.value = '';
        this.elements.dmsLon.value = '';
        
        this.clearOutputs();
        this.clearError();
        
        // Focus first input
        this.elements.ddLat.focus();
    },
    
    /**
     * Handle copy button click
     * @param {Event} e - Click event
     */
    handleCopy: function(e) {
        const targetId = e.target.dataset.target;
        const element = document.getElementById(targetId);
        const text = element.textContent;
        
        if (text === '-') {
            return;
        }
        
        navigator.clipboard.writeText(text).then(() => {
            const originalText = e.target.textContent;
            e.target.textContent = '✅';
            e.target.style.background = '#4CAF50';
            
            setTimeout(() => {
                e.target.textContent = originalText;
                e.target.style.background = '';
            }, 1500);
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showError('❌ Errore: impossibile copiare negli appunti');
        });
    },
    
    /**
     * Monitor network status
     */
    monitorNetworkStatus: function() {
        const updateStatus = () => {
            const isOnline = navigator.onLine;
            const statusEl = this.elements.onlineStatus;
            
            if (isOnline) {
                statusEl.textContent = '● Online';
                statusEl.className = 'status-badge online';
            } else {
                statusEl.textContent = '● Offline';
                statusEl.className = 'status-badge offline';
            }
        };
        
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        
        // Initial status
        updateStatus();
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
