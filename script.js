document.addEventListener('DOMContentLoaded', () => {
    // 1. Cache DOM elements
    const timeIndicator = document.getElementById('time-indicator');
    const mainElement = document.querySelector('main');
    // 'sections' is an array of the actual DOM <section> elements, used by IntersectionObserver later
    const sections = Array.from(mainElement.querySelectorAll('section')); 
    
    let currentActiveSectionId = null; // Tracks the ID of the section currently displayed in the indicator

    const earthTotalHistoryMa = 4540; // Approx. 4.54 billion years

    // 2. Store data for each section (used by time indicator logic)
    const sectionData = sections.map(sectionEl => { // 'sections' here is the array of DOM elements
        return {
            element: sectionEl, // Keep reference to the DOM element
            id: sectionEl.id,
            title: sectionEl.querySelector('h2').textContent,
            dateRange: sectionEl.querySelector('.date-range').textContent,
            depthMarker: sectionEl.dataset.depthMarker 
        };
    });

    // Helper function to format 'Million years ago' (Ma) into a human-readable string
    function formatYearsAgo(ma) {
        if (ma === undefined || isNaN(ma)) {
            return 'Time Unknown';
        }
        if (ma > earthTotalHistoryMa) { 
            ma = earthTotalHistoryMa;
        }
        if (ma < 0) { 
            ma = 0;
        }

        if (ma >= 1000) { 
            return `${(ma / 1000).toFixed(2)} Ga ago`;
        } else if (ma >= 1) { 
            return `${ma.toFixed(1)} Ma ago`;
        } else if (ma * 1000 >= 1) { 
            return `${(ma * 1000).toFixed(0)} Ka ago`;
        } else if (ma * 1000 * 1000 >= 1) { 
            return `${Math.round(ma * 1000 * 1000)} years ago`;
        } else if (ma === 0) { 
            return 'Present Day';
        }
        return 'Present Day'; 
    }

    // 3. Implement updateContinuousTimeIndicator function
    function updateContinuousTimeIndicator() {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const currentScrollY = window.scrollY;
        
        if (scrollableHeight <= 0) { 
            timeIndicator.textContent = `Time: ${formatYearsAgo(0)}`;
            return;
        }

        const scrollFraction = currentScrollY / scrollableHeight;
        const timeElapsedMa = scrollFraction * earthTotalHistoryMa; 
        
        timeIndicator.textContent = `Time: ${formatYearsAgo(timeElapsedMa)}`;
    }

    // 4. Implement updateSectionBasedTimeIndicator function
    function updateSectionBasedTimeIndicator() {
        let activeSectionDataObj = null; // Renamed to avoid conflict with 'sections' array of DOM elements
        const viewportMidY = window.innerHeight / 2;

        for (let i = sectionData.length - 1; i >= 0; i--) {
            const currentSectionObj = sectionData[i]; // This is an object from sectionData array
            const rect = currentSectionObj.element.getBoundingClientRect(); // Access DOM element via .element
            if (rect.top < viewportMidY) {
                activeSectionDataObj = currentSectionObj;
                break; 
            }
        }
        
        if (window.scrollY < 50 && sectionData.length > 0) { 
            const firstSectionObj = sectionData[0];
            const firstSectionRect = firstSectionObj.element.getBoundingClientRect();
            if (firstSectionRect.top < viewportMidY) {
                if (activeSectionDataObj === null || firstSectionObj.id === activeSectionDataObj.id || firstSectionRect.top > (activeSectionDataObj?.element.getBoundingClientRect().top || -Infinity)) {
                   activeSectionDataObj = firstSectionObj;
                }
            }
        }

        if (activeSectionDataObj) {
            if (currentActiveSectionId !== activeSectionDataObj.id) {
                timeIndicator.textContent = `Now: ${activeSectionDataObj.title} (${activeSectionDataObj.dateRange})`;
                currentActiveSectionId = activeSectionDataObj.id;
            }
        } else {
            currentActiveSectionId = null; 
        }
    }
    
    let ticking = false; 

    // 5. Add a scroll event listener to the window
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateContinuousTimeIndicator(); 
                updateSectionBasedTimeIndicator(); 
                ticking = false;
            });
            ticking = true;
        }
    }

    // Initial setup for time indicator
    updateContinuousTimeIndicator(); 
    updateSectionBasedTimeIndicator(); 
    window.addEventListener('scroll', onScroll, { passive: true });

    // IntersectionObserver for Section Fade-in
    // The 'sections' variable (Array of DOM <section> elements) is already cached at the top of this listener.
    
    // Initially add 'section-fade-in' class to all sections that will be animated
    sections.forEach(sectionDOMElement => { // 'sections' is the array of DOM elements
        sectionDOMElement.classList.add('section-fade-in');
    });

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-is-visible');
                // Optional: unobserve after animation to save resources
                // observer.unobserve(entry.target); 
            }
            // Optional: To re-trigger animation every time it scrolls in/out
            // else {
            //     entry.target.classList.remove('section-is-visible');
            // }
        });
    }, {
        root: null, // viewport
        threshold: 0.15, // Trigger when 15% of the section is visible
        // rootMargin: "0px 0px -50px 0px" // Optional: adjust trigger point
    });

    sections.forEach(sectionDOMElement => { // Iterate over the array of DOM elements
        sectionObserver.observe(sectionDOMElement);
    });

});
