// Wait for the DOM to fully load before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Load saved settings from Chrome Storage when popup opens
    chrome.storage.local.get([
        'timeLimit', 'breakTimeSec', 'startTime', 'endTime', 
        'blockList', 'dogSelect', 'quickSites', 'alwaysActive'
    ], (data) => {
        // Populate inputs with saved data (or defaults if undefined)
        if (data.timeLimit) document.getElementById('timeLimit').value = data.timeLimit;
        if (data.breakTimeSec) document.getElementById('breakTimeSec').value = data.breakTimeSec;
        if (data.startTime) document.getElementById('startTime').value = data.startTime;
        if (data.endTime) document.getElementById('endTime').value = data.endTime;
        if (data.blockList) document.getElementById('blockList').value = data.blockList;
        if (data.dogSelect) document.getElementById('dogSelect').value = data.dogSelect;
        
        // Handle checkboxes for Quick Sites
        if (data.quickSites) {
            document.querySelectorAll('.quick-site').forEach(cb => {
                cb.checked = data.quickSites.includes(cb.value);
            });
        }

        // Handle Always Active toggle state
        if (data.alwaysActive !== undefined) {
            document.getElementById('alwaysActive').checked = data.alwaysActive;
        }
        // Initialize the UI state based on the checkbox
        toggleTimeInputs(document.getElementById('alwaysActive').checked);
    });

    // 2. Listen for changes on the "Always Active" checkbox
    document.getElementById('alwaysActive').addEventListener('change', (e) => {
        toggleTimeInputs(e.target.checked);
    });

    // Helper function to disable/enable time inputs visually and functionally
    function toggleTimeInputs(isAlwaysActive) {
        const container = document.getElementById('timeContainer');
        if (isAlwaysActive) {
            container.style.opacity = '0.3';
            container.style.pointerEvents = 'none'; // Prevent clicks
        } else {
            container.style.opacity = '1';
            container.style.pointerEvents = 'auto'; // Allow clicks
        }
    }

    // 3. Save settings when the "Save & Apply" button is clicked
    document.getElementById('saveBtn').addEventListener('click', () => {
        // Gather all checked Quick Sites
        const checkedSites = Array.from(document.querySelectorAll('.quick-site:checked')).map(cb => cb.value);

        // Build the settings object
        const settings = {
            timeLimit: parseFloat(document.getElementById('timeLimit').value) || 30, // Default to 30 mins
            breakTimeSec: parseFloat(document.getElementById('breakTimeSec').value) || 5, // Default to 5 mins
            startTime: document.getElementById('startTime').value,
            endTime: document.getElementById('endTime').value,
            blockList: document.getElementById('blockList').value,
            dogSelect: document.getElementById('dogSelect').value,
            quickSites: checkedSites,
            alwaysActive: document.getElementById('alwaysActive').checked
        };

        // Save to Chrome Storage
        chrome.storage.local.set(settings, () => {
            // Show a brief success message
            const status = document.getElementById('status');
            status.style.display = 'block';
            setTimeout(() => { 
                status.style.display = 'none'; 
            }, 2000);
        });
    });
});