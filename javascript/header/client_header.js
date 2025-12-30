/**
 * AutocompleteManager - Handles all autocomplete functionality for the header search
 */
class AutocompleteManager {
    constructor(searchInput, searchButton, categorySelect, shadowRoot) {
        this.searchInput = searchInput;
        this.searchButton = searchButton;
        this.categorySelect = categorySelect;
        this.shadowRoot = shadowRoot;
        this.cache = {};
        this.debounceTimeout = null;
        this.currentIndex = -1;
        this.originalQuery = '';
        this.currentSearchQuery = '';
        
        this.init();
    }

    /**
     * Initialize autocomplete functionality
     */
    init() {
        // create suggestions container first so suggestionsList exists
        this.createSuggestionsContainer();
        this.setupEventListeners();
    }

    /**
     * Create suggestions container in shadow DOM
     */
    createSuggestionsContainer() {
        const suggestionsBox = document.createElement('div');
        suggestionsBox.className = 'kray-suggestions-box';
        suggestionsBox.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #ffffff;
            border: 1px solid #ddd;
            border-radius: 3px;
            max-height: 250px;
            overflow-y: auto;
            display: none;
            z-index: 1000;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
            margin-top: 4px;
        `;
        suggestionsBox.innerHTML = `
            <ul class="kray-suggestions-list" style="list-style: none; margin: 0; padding: 0;"></ul>
        `;
        
        this.searchInput.parentElement.style.position = 'relative';
        this.searchInput.parentElement.appendChild(suggestionsBox);
        this.suggestionsBox = suggestionsBox;
        this.suggestionsList = suggestionsBox.querySelector('.kray-suggestions-list');
    }

    /**
     * Setup all event listeners for autocomplete
     */
    setupEventListeners() {
        // Input focus event
        this.searchInput.addEventListener('focus', (e) => this.handleInputFocus(e));
        
        // Input event for typing
        this.searchInput.addEventListener('input', (e) => this.handleInputChange(e));
        
        // Keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Click outside to close suggestions
        document.addEventListener('click', (e) => this.handleClickOutside(e));
        
        // Search button click
        this.searchButton.addEventListener('click', () => this.performSearch());
        
        // Suggestion item click
        this.suggestionsList.addEventListener('click', (e) => this.handleSuggestionClick(e));
        
        // Suggestion mouseover and mouseleave for hover behavior
        this.suggestionsBox.addEventListener('mouseover', (e) => this.handleSuggestionHover(e));
        this.suggestionsBox.addEventListener('mouseleave', () => this.handleSuggestionLeave());
    }



      //Store original query when suggestions open
    storeOriginalQuery() {
        if (!this.originalQuery) {
            this.originalQuery = this.searchInput.value;
        }
    }

    /**
     * Handle suggestion hover (mouseover)
     */
    handleSuggestionHover(e) {
        const li = e.target.closest('li');
        if (li && li.textContent) {
            this.storeOriginalQuery();
            this.searchInput.value = li.textContent.trim();
        }
    }

    /**
     * Handle suggestion leave (mouseleave) - restore original query
     */
    handleSuggestionLeave() {
        if (this.originalQuery !== undefined) {
            this.searchInput.value = this.originalQuery;
        }
    }

    /**
     * Handle input focus
     */
    async handleInputFocus(e) {
        this.currentIndex = -1;
        this.storeOriginalQuery()
        if (this.searchInput.value.length === 0) {
            let defaultSuggestions = await this.fetchDefaultSuggestions();
            // Ensure it's always an array
            if (!Array.isArray(defaultSuggestions)) {
                defaultSuggestions = [];
            }
            this.showSuggestions(defaultSuggestions);
        } else if (this.searchInput.value.length >= 3) {
            this.debounceFetchSuggestions(this.searchInput.value);
        }
    }

    /**
     * Handle input change
     */
    handleInputChange(e) {
        const query = this.searchInput.value.trim();
        
        // Reset original query when user starts typing fresh
        this.originalQuery = query;
        
        if (query.length >= 3) {
            this.debounceFetchSuggestions(query);
        } else if (query.length === 0) {
            // Clear original query when input is fully emptied
            this.originalQuery = '';
            this.suggestionsBox.style.display = 'none';
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboard(e) {
        const items = this.suggestionsList.querySelectorAll('li');
        const total = items.length;

        if (!total) return;

        // Store original query on first arrow key
        if (this.currentIndex === -1 && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            this.originalQuery = this.searchInput.value;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            this.currentIndex = this.currentIndex === total - 1 ? -1 : this.currentIndex + 1;
            this.updateHoverState(items);
            return;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            this.currentIndex = this.currentIndex === -1 ? total - 1 : this.currentIndex - 1;
            this.updateHoverState(items);
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            this.suggestionsBox.style.display = 'none';
            const query = this.searchInput.value.trim();
            if (query) {
                this.performSearch(query);
            }
        }
    }

    /**
     * Update hover state for keyboard navigation
     */
    updateHoverState(items) {
        items.forEach(li => li.classList.remove("hover"));

        if (this.currentIndex === -1) {
            this.searchInput.value = this.originalQuery;
            return;
        }

        if (this.currentIndex < 0 || this.currentIndex >= items.length) return;

        const li = items[this.currentIndex];
        li.classList.add("hover");
        this.searchInput.value = li.textContent.trim();
        li.scrollIntoView({ block: "nearest" });
    }

    /**
     * Handle click outside suggestions
     */
    handleClickOutside(e) {
        // support Shadow DOM events
        const path = (e.composedPath && e.composedPath()) || e.path || [];
        const clickedInside = path.includes(this.searchInput) || path.includes(this.suggestionsBox) ||
                              this.searchInput === e.target || this.suggestionsBox === e.target;
        if (!clickedInside && this.suggestionsBox) {
            this.suggestionsBox.style.display = 'none';
        }
    }

    /**
     * Handle suggestion item click
     */
    handleSuggestionClick(e) {
        const li = e.target.closest('li');
        if (!li) return;

        const selectedQuery = li.textContent.trim();
        this.searchInput.value = selectedQuery;
        this.suggestionsBox.style.display = 'none';
        this.performSearch(selectedQuery);

        // Train the autocomplete
        this.trainAutocomplete(selectedQuery);
    }

    /**
     * Fetch suggestions from API
     */
    async fetchSuggestions(query) {
        if (this.cache[query]) return this.cache[query];
        try {
            const url = 'https://staging-search.kray.ai/search/autocomplete?namespace=casters&unique=True';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    "prefix": query,
                    "group": "all"
                })
            });

            const data = await response.json();
            // keep full objects so .suggest.input and .category remain available
            const items = Array.isArray(data) ? data : (data && Array.isArray(data.response) ? data.response : (data && Array.isArray(data.suggestions) ? data.suggestions : []));
            this.cache[query] = items;
            return items;
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    /**
     * Fetch default suggestions when input is empty
     */
    async fetchDefaultSuggestions() {
        try {
            const response = await fetch('https://staging-search.kray.ai/search/suggestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    "namespace": "casters",
                    "group": "all"
                })
            });

            const data = await response.json();
            // Ensure we return an array
            if (Array.isArray(data)) {
                return data;
            } else if (data && typeof data === 'object') {
                // If response is an object with suggestions inside, extract it
                return data.suggestions || data.results || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching default suggestions:', error);
            return [];
        }
    }

    /**
     * Fetch prefix/scope suggestions
     */
    async fetchPrefixes(group = "all") {
        try {
            const trainer_baseUrl = "https://staging-search.kray.ai";
            const storeName = "casters";
            const url = `${trainer_baseUrl}/autocomplete/prefixes/${storeName}/${group}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (!data || !Array.isArray(data.prefixes)) {
                throw new Error("Invalid response format: Missing 'prefixes' array.");
            }

            let rawList = [...new Set(data.prefixes)].slice(0, 5);
            
            const uniquePrefixes = rawList.map(text => {
                let modifiedText = text.replace(/(\d)"\s*|(\d)"$/g, '$1$2 inch ');
                return modifiedText.trim();
            });

            return uniquePrefixes.filter(p => p.length > 0);
        } catch (error) {
            console.error(`Error fetching prefixes:`, error);
            return [];
        }
    }

    /**
     * Debounce function for fetching suggestions
     */
    debounceFetchSuggestions(query) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(async () => {
            const suggestions = await this.fetchSuggestions(query);
            this.showSuggestions(suggestions);
        }, 300);
    }

    /**
     * Display suggestions
     */
    showSuggestions(suggestions) {
        const dropdown = this.suggestionsList;
        dropdown.innerHTML = '';
        if (!Array.isArray(suggestions) || suggestions.length === 0) {
            const li = document.createElement('li');
            li.textContent = this.searchInput.value || 'No suggestions';
            dropdown.appendChild(li);
            this.suggestionsBox.style.display = 'block';
            return;
        }

        const currentQuery = this.searchInput.value.trim().toLowerCase();
        // Group by category
        const grouped = {};
        suggestions.forEach(item => {
            const cat = (item?.category || '').replace(/_/g, ' ').trim();
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);
        });

        Object.entries(grouped).forEach(([cat, items]) => {
            if (items.length > 1 && cat && cat !== 'products') {
                // category header like "In <cat>"
                const hdr = document.createElement('div');
                hdr.className = 'suggestion-category-header';
                hdr.innerHTML = 'In <span>' + cat + '</span>';
                dropdown.appendChild(hdr);
                items.forEach(it => {
                    const text = it?.suggest?.input || '';
                    const opt = this._createSuggestionItem(text, currentQuery, cat, true);
                    opt.classList.add('grouped-item');
                    dropdown.appendChild(opt);
                });
            } else {
                items.forEach(it => {
                    const text = it?.suggest?.input || '';
                    const opt = this._createSuggestionItem(text, currentQuery, cat, false);
                    // append suffix for single item (if not products)
                    if (cat && cat !== 'products') {
                        const span = document.createElement('span');
                        span.className = 'suggestion-category';
                        span.textContent = ' in ' + cat;
                        // ensure styling matches testplugin (green, italic)
                        span.style.cssText = 'font-weight:700; color:#7FC143; font-style:italic; margin-left:6px;';
                        opt.appendChild(span);
                    }
                    dropdown.appendChild(opt);
                });
            }
        });

        this.suggestionsBox.style.display = 'block';
    }

    /**
     * Create suggestion item for dropdown
     */
    _createSuggestionItem(text, currentQuery, category, grouped) {
        const option = document.createElement('li');
        option.className = 'kray-suggestion-item';
        // minimal XSS-safe escaping
        const escapeHtml = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
        const lower = (text || '').toLowerCase();
        const idx = lower.indexOf(currentQuery);
        if (idx !== -1 && currentQuery.length > 0) {
            const before = escapeHtml(text.substring(0, idx));
            const match = escapeHtml(text.substring(idx, idx + currentQuery.length));
            const after = escapeHtml(text.substring(idx + currentQuery.length));
            // typed part (what user typed) stays normal weight; suggested remainder is bold
            option.innerHTML = before + '<span class="typed-text">' + match + '</span>' + '<span class="suggested-text">' + after + '</span>';
        } else {
            // show full suggestion as suggested-text (bold) when no typed match present
            option.innerHTML = '<span class="suggested-text">' + escapeHtml(text) + '</span>';
        }
        // store category for click behavior
        if (category) option.dataset.category = category.replace(/\s+/g, '_');
        option.addEventListener('click', () => {
            this.searchInput.value = text;
            if (option.dataset.category) this.categorySelect.value = option.dataset.category;
            this.suggestionsBox.style.display = 'none';
            this.performSearch(text);
        });
        option.addEventListener('mouseover', () => {
            this.searchInput.value = text;
        });
        return option;
    }

    /**
     * Perform search
     */
    performSearch(query = null) {
        const searchQuery = query || this.searchInput.value.trim();
        const category = this.categorySelect.value;

        if (!searchQuery) return;

        this.currentSearchQuery = searchQuery;
        
        // Call the redirect function from window.ClientSiteData
        if (window.ClientSiteData && window.ClientSiteData.redirectToSearch) {
            window.ClientSiteData.redirectToSearch(category, searchQuery);
        }

        // Train the autocomplete
        this.trainAutocomplete(searchQuery);
    }

    // /**
    //  * Train autocomplete with search query
    //  */
    // trainAutocomplete(query) {
    //     fetch("https://staging-search.kray.ai/train/autocomplete/search-query", {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify({
    //             store_name: "casters",
    //             prefix: query,
    //             domain: window.location.hostname
    //         })
    //     })
    //     .then(response => response.json())
    //     .then(result => {
    //         if (result.status === "failed") {
    //             console.error("Query training failed:", result.message);
    //         }
    //     })
    //     .catch(error => console.error("Autocomplete training error:", error));
    // }

    // /**
    //  * Clear cache
    //  */
    clearCache() {
        this.cache = {};
    }
}

// Inject custom CSS for live site header#header padding
function injectHeaderPaddingCSS() {
    const style = document.createElement('style');
    style.innerHTML = 'header#header { padding: 140px 20px 15px !important; }';
    document.head.appendChild(style);
}

// Run the injection when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHeaderPaddingCSS);
} else {
    injectHeaderPaddingCSS();
}
(function() {
    'use strict';

    /**
     * Hide existing headers to prevent FOUC and conflicts
     */
        function hideExistingHeaders() {
            const headerNew = document.querySelector(".header-new");
            if (!headerNew) return;

            // Get ONLY the first child inside header-new
            const firstRow = headerNew.querySelector(":scope > .row:nth-child(1)");
            if (firstRow) {
                firstRow.style.display = "none";
                firstRow.style.visibility = "hidden";
            }

            // To be sure the second child stays visible:
            const secondRow = headerNew.querySelector(":scope > .row:nth-child(2)");
            if (secondRow) {
                secondRow.style.display = "";
                secondRow.style.visibility = "visible";
            }
        }

    /**
     * Initialize and render the custom header
     */
    function initHeader() {
        // Hide existing headers first
        hideExistingHeaders()
      

        // Find the placeholder container
        const container = document.getElementById("kray-header");
        if (!container) {
            console.warn("Kray Header: Container element #kray-header not found");
            return;
        }

        // Create Shadow DOM for style isolation
        const shadow = container.attachShadow({ mode: "open" });

        // Inject header HTML and CSS
        shadow.innerHTML = `
            <style>
                /* Reset and base styles */
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                /* Hide mobile-header from the live website globally */
                .mobile-header {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                }



                /* Main header container */

                .kray-header {
                    width: 100%;
                    background: #ffffff;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    position: fixed;
                    z-index: 9999;
                }

                /* Inner wrapper for content */
                .kray-header-inner {
                    max-width: clamp(1200px, 85vw, 2200px);
                    margin-left: clamp(80px, 8vw, 320px);
                    margin-right: clamp(80px, 8vw, 320px);
                    margin-top: 50px;
                    margin-bottom:0px;
                    padding: 12px 0;
                    min-height: auto;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 0px;
                }

                /* Logo section */
                .client-site-logo {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    width: 243px;
                    height: 66px;
                    margin-right: 25px;
                }

                .client-site-logo img {
                    height: 66px;
                    width: 243px;
                    object-fit: contain;
                }

                /* Category dropdown */
                .kray-category {
                    flex-shrink: 0;
                    margin-left: 0;
                    margin-right: 0;
                    position: relative;
                    width: 83px;
                    height: 44px;
                }

                .kray-category-select {
                    height: 44px;
                    width: 83px;
                    padding: 0 12px;
                    border: 1.5px solid #003E4A;
                    box-shadow: -4px 0 8px -2px #e6f4dd, 0 4px 8px -2px #e6f4dd, 0 -4px 8px -2px #e6f4dd;
                    border-radius: 3px;
                    font-size: 14px;
                    color: #374151;
                    background: #ffffff;
                    cursor: pointer;
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 8px center;
                    box-sizing: border-box;
                }

                /* Search bar section */
                .kray-search-wrapper {
                    flex: 1 1 auto;   /* 👈 grow with screen */
                    max-width: 900px; /* optional safety cap */
                    height: 44px;
                    display: flex;
                    position: relative;
                    margin-right: 12px;
                }

                .kray-search-input {
                    width: 100%;
                    min-width: 316px;
                    height: 44px;
                    padding: 0 40px 0 12px;
                    border: 1.5px solid #003E4A;
                    box-shadow: 4px 0 8px -2px #e6f4dd, 0 4px 8px -2px #e6f4dd, 0 -4px 8px -2px #e6f4dd;
                    border-radius: 3px;
                    font-size: 14px;
                    color: #1f2937;
                    background: #ffffff;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                    order: 1;
                }

                .kray-search-input::placeholder {
                    color: #9ca3af;
                    font-size: 12px;
                }

                .kray-search-button {
                    background: #80C343;
                    border: 1.5px solid #003E4A;
                    box-shadow: none;
                    border-radius: 3px;
                    padding: 0;
                    height: 44px;
                    width: 44px;
                    min-width: 44px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: absolute;
                    top: 0;
                    right: 0;
                    z-index: 3;
                    flex-shrink: 0;
                }

                .kray-search-icon {
                    width: 20px;
                    height: 20px;
                    fill: #003E4A;
                }
                .kray-action-btn svg {
                    width: 32px;
                    height: 32px;
                }
                .kray-action-btn.primary {
                    font-size: 28px;
                }
                // @media (max-width: 1280px) {
                //     .kray-search-icon {
                //         width: 20px !important;
                //         height: 20px !important;
                //     }
                //     .kray-action-btn svg {
                //         width: 20px !important;
                //         height: 20px !important;
                //     }
                //     .kray-action-btn.primary {
                //         font-size: 14px !important;
                //         margin-left: 12px;
                //     }
                // }

                .kray-search-button:hover .kray-search-icon {
                    fill: #fff;
                }

                /* Autocomplete suggestions styling */
                .kray-suggestions-box {
                    background: #ffffff !important;
                    border: 1px solid #ddd !important;
                    border-radius: 3px !important;
                    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1) !important;
                }

                .kray-suggestions-box li {
                    padding: 10px 12px !important;
                    cursor: pointer !important;
                    border-bottom: 1px solid #f0f0f0 !important;
                    font-size: 13px !important;
                    color: #374151 !important;
                    transition: background-color 0.2s !important;
                }

                .kray-suggestions-box li:hover,
                .kray-suggestions-box li.hover {
                    background-color: #f0f0f0 !important;
                }

                .kray-suggestions-box li:last-child {
                    border-bottom: none !important;
                }

                /* Highlighting: typed (user) text = normal; suggested text = bold (match testplugin.php) */
                .kray-suggestions-box .typed-text {
                    font-weight: 400 !important;
                    color: #133E46 !important;
                }
                .kray-suggestions-box .suggested-text {
                    font-weight: 700 !important;
                    color: #133E46 !important;
                }
                
                /* Align grouped suggestions with regular items (remove extra left gap) */
                .kray-suggestions-box .grouped-item {
                    padding-left: 24px !important; /* indent under category header */
                }
                /* Ensure category header lines up with list items */
                .kray-suggestions-box .suggestion-category-header {
                    padding-left: 12px !important;
                    box-sizing: border-box;
                }
                
                /* Action buttons section */
                .kray-actions {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .suggestion-category-header {
                  padding: 8px 12px;
                  color: #7FC143;
                   font-style: italic;
                 font-weight: 700;
                   font-size: 13px;
              }
                .suggestion-category-header span {
                   color: inherit;
                  font-weight: inherit;
                  font-style: inherit;
               }
              .kray-suggestions-box .suggestion-category {
                  font-weight: 700;
                  color: #7FC143;
                  font-style: italic;
                 margin-left: 6px;
                  font-size: 13px;
            }

                @media (min-width: 1200px) {
                    .mobile-header {
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        pointer-events: auto !important;
                    }
                    .kray-search-wrapper {
                      position: relative;
                   }
                   .kray-suggestions-box {
                       width: calc(100% - 83px) !important; /* search input width (exclude 83px category dropdown) */
                      left: 83px !important; /* align with search input start */
                      right: auto !important;
                   }
                }

                .kray-action-btn {
                    width: 44px;
                    height: 44px;
                    padding: 0;
                    background: #ffffff;
                    border: 1px solid #003E4A;
                    box-shadow: 0 2px 8px 0 rgba(128, 195, 67, 0.18);
                    border-radius: 3px;
                    font-size: 16px;
                    color: #374151;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0;
                    flex-shrink: 0;
                }

                .kray-action-btn svg {
                    width: 25px;
                    height: 25px;
                }

                .kray-action-btn:hover {
                    background: #f9fafb;
                    border-color: #003E4A;
                }

                .kray-action-btn.primary {
                    width: 148px;
                    height: 44px;
                    background: #80C343;
                    color: #003E4A;
                    border-color: #003E4A;
                    font-weight: 600;
                    font-size: 13px;
                    padding: 0 12px;
                    gap: 4px;
                }

                .kray-phone-text {
                    display: none;
                    margin-left: 6px;
                }

                .kray-action-btn.primary:hover {
                    background: #003E4A;
                    color: #fff;
                }

                /* USA Flag */
                .kray-flag {
                    width: 90px;
                    height: 65.9px;
                    border-radius: 4px;
                    overflow: hidden;
                    margin: 0;
                    border: none;
                    box-shadow: none;
                    padding: 0;
                }

                .kray-flag img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* Mobile menu button */
                .kray-mobile-menu-btn {
                    display: none;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 8px;
                    z-index: 10;
                    position: relative;
                }

                .kray-mobile-menu-btn svg {
                    width: 32px;
                    height: 32px;
                    fill: #ffffff;
                    display: block;
                }
                

                /* Mobile: hide USA flag, align action buttons in one row, search bar below */
                @media (max-width: 1199px) {
                    .kray-header-inner {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 0;
                        padding: 0;
                        position: relative;
                        margin: 0;
                        max-width: 100%;
                    }
                    .client-site-logo {
                        order: 1;
                        justify-content: flex-start;
                        margin-bottom: 12px;
                        width: 100%;
                        min-width: 0;
                        flex: 1 1 0;
                        max-width: none;
                        position: relative;
                        padding: 12px 20px;
                        background: #003E4A;
                        height: auto;
                    }
                    .client-site-logo img {
                        content: url('https://www.casterconcepts.com/wp-content/uploads/2023/01/cci-logo-inverted.png');
                        background: transparent;
                        padding: 0;
                        border-radius: 0;
                        height: 48px;
                        width: auto;
                    }
                    .kray-mobile-menu-btn {
                        display: block !important;
                        position: absolute;
                        top: 12px;
                        right: 20px;
                        z-index: 11;
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        padding: 12px;
                        height: 48px;
                        width: 48px;
                        margin: 0;
                    }
                    .kray-actions {
                        order: 2;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        justify-content: flex-start;
                        align-items: center;
                        gap: 8px;
                        margin: 12px 20px;
                        width: calc(100% - 40px);
                        min-width: 0;
                        flex: 0 0 auto;
                        max-width: none;
                    }
                    .kray-action-btn {
                        margin-left: 0 !important;
                        margin-right: 0 !important;
                        min-width: 0;
                        box-sizing: border-box;
                        padding: 0 8px;
                        font-size: 12px;
                        height: 44px;
                        justify-content: center;
                        text-align: center;
                    }
                    /* Request a Quote - first in visual order */
                    .kray-action-btn:nth-child(3) {
                        order: 1;
                        width: 205px;
                        flex: 0 0 205px;
                    }
                    /* Call button - second in visual order */
                    .kray-action-btn:nth-child(1) {
                        order: 2;
                        flex: 1 1 auto;
                        width: auto;
                    }
                    .kray-action-btn:nth-child(1) .kray-phone-text {
                        display: inline;
                    }
                    /* Profile button - third in visual order */
                    .kray-action-btn:nth-child(2) {
                        order: 3;
                        flex: 0 0 44px;
                        width: 44px;
                    }
                    .kray-actions .kray-flag {
                        display: none !important;
                    }
                    .kray-category {
                        order: 1;
                        width: auto;
                        margin-bottom: 0;
                        margin-left: 0 !important;
                        min-width: 0;
                        flex: 0 0 auto;
                        max-width: none;
                    }
                    .kray-search-wrapper {
                        order: 3;
                        width: calc(100% - 40px);
                        max-width: 308px;
                        margin: 10px 20px 12px 20px;
                        display: flex;
                        flex-direction: row;
                        gap: 0;
                        min-width: 0;
                        flex: 0 0 auto;
                    }
                    .kray-category-select {
                        font-size: 14px !important;
                        height: 44px !important;
                        min-width: 0 !important;
                        width: auto !important;
                        flex: 0 0 auto !important;
                        max-width: 70px !important;
                        margin-right: 0 !important;
                        margin-left: 0 !important;
                        border-radius: 3px 0 0 3px;
                        box-sizing: border-box;
                        padding: 0 24px 0 12px !important;
                    }
                    .kray-search-input {
                        font-size: 14px !important;
                        height: 44px !important;
                        padding: 0 44px 0 12px !important;
                        min-width: 0 !important;
                        flex: 1 1 auto !important;
                        width: 100% !important;
                        max-width: none !important;
                        border-radius: 0 3px 3px 0;
                    }
                    .kray-search-button {
                        background: #80C343;
                        border: 1.5px solid #003E4A;
                        box-shadow: none;
                        border-radius: 3px;
                        height: 44px;
                        width: 44px;
                        min-width: 44px;
                        padding: 0;
                        top: 0;
                        right: 0;
                    }
                }

                /* Large screens: 991px - 1199px - Two row layout with hamburger menu */
                @media (min-width: 991px) and (max-width: 1199px) {
                    .kray-header-inner {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 0;
                        padding: 0;
                        position: relative;
                        margin: 0;
                        max-width: 100%;
                    }
                    .client-site-logo {
                        order: 1;
                        justify-content: flex-start;
                        margin-bottom: 0;
                        width: 100%;
                        min-width: 0;
                        flex: 1 1 0;
                        max-width: none;
                        position: relative;
                        padding: 12px 80px;
                        background: #003E4A;
                    }
                    .client-site-logo img {
                        content: url('https://www.casterconcepts.com/wp-content/uploads/2023/01/cci-logo-inverted.png');
                        background: transparent;
                        padding: 0;
                        border-radius: 0;
                        height: 48px;
                    }
                    .kray-mobile-menu-btn {
                        display: block !important;
                        position: absolute;
                        top: 12px;
                        right: 80px;
                        z-index: 11;
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        padding: 12px;
                        height: 48px;
                        width: 48px;
                    }
                    .kray-mobile-menu-btn svg {
                        width: 24px;
                        height: 24px;
                        fill: #ffffff;
                        display: block;
                    }
                    /* Combined row for search and actions */
                    .kray-search-wrapper {
                        order: 2;
                        width: calc(100% - 520px);
                        max-width: none;
                        margin: 17px 400px 12px 80px;
                        display: flex;
                        flex-direction: row;
                        gap: 0;
                        min-width: 457px;
                        flex: 1 1 auto;
                    }
                    .kray-category-select {
                        font-size: 14px !important;
                        height: 44px !important;
                        min-width: 70px !important;
                        width: auto !important;
                        flex: 0 0 auto !important;
                        max-width: 90px !important;
                        margin-right: 0 !important;
                        margin-left: 0 !important;
                        border-radius: 3px 0 0 3px;
                        box-sizing: border-box;
                        padding: 0 24px 0 12px !important;
                    }
                    .kray-search-input {
                        font-size: 14px !important;
                        height: 44px !important;
                        padding: 0 44px 0 12px !important;
                        min-width: 0 !important;
                        flex: 1 1 auto !important;
                        width: 100% !important;
                        max-width: none !important;
                        border-radius: 0 3px 3px 0;
                    }
                    .kray-search-button {
                        background: #80C343;
                        border: 1.5px solid #003E4A;
                        box-shadow: none;
                        border-radius: 3px;
                        height: 44px;
                        width: 44px;
                        min-width: 44px;
                        padding: 0;
                        top: 0;
                        right: 0;
                    }
                    .kray-actions {
                        order: 2;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        justify-content: flex-start;
                        align-items: center;
                        gap: 8px;
                        margin: 0 80px 0 16px;
                        width: auto;
                        min-width: 0;
                        flex: 0 0 auto;
                        max-width: none;
                        position: absolute;
                        right: 0;
                        top: 84px;
                    }
                    .kray-action-btn {
                        margin-left: 0 !important;
                        margin-right: 0 !important;
                        min-width: 0;
                        box-sizing: border-box;
                        padding: 0 8px;
                        font-size: 12px;
                        height: 44px;
                        justify-content: center;
                        text-align: center;
                    }
                    /* Call button - first in visual order - 44 X 44 */
                    .kray-action-btn:nth-child(1) {
                        order: 1;
                        width: 44px;
                        flex: 0 0 44px;
                        height: 44px;
                    }
                    .kray-action-btn:nth-child(1) .kray-phone-text {
                        display: none;
                    }
                    /* Profile button - second in visual order - 44 X 44 */
                    .kray-action-btn:nth-child(2) {
                        order: 2;
                        flex: 0 0 44px;
                        width: 44px;
                        height: 44px;
                    }
                    /* Request a Quote - third in visual order - 148 X 44 */
                    .kray-action-btn:nth-child(3) {
                        order: 3;
                        width: 148px;
                        flex: 0 0 148px;
                        height: 44px;
                    }
                    /* Show flag - fourth in visual order - 90 X 65.9 */
                    .kray-actions .kray-flag {
                        display: flex !important;
                        order: 4;
                        width: 90px;
                        height: 65.9px;
                        flex: 0 0 90px;
                    }
                    .kray-category {
                        order: 1;
                        width: auto;
                        margin-bottom: 0;
                        margin-left: 0 !important;
                        min-width: 0;
                        flex: 0 0 auto;
                        max-width: none;
                    }
                    .kray-search-wrapper {
                      position: relative;
                   }
                   .kray-suggestions-box {
                       width: calc(100% - 90px) !important; /* search input width (exclude 83px category dropdown) */
                      left: 90px !important; /* align with search input start */
                      right: auto !important;
                   }
                }

                /* Medium screens: 629px - 990px */
                @media (min-width: 629px) and (max-width: 990px) {
                    .kray-header-inner {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 0;
                        padding: 0;
                        position: relative;
                        margin: 0;
                        max-width: 100%;
                    }
                    .client-site-logo {
                        order: 1;
                        justify-content: flex-start;
                        margin-bottom: 0;
                        width: 100%;
                        min-width: 0;
                        flex: 1 1 0;
                        max-width: none;
                        position: relative;
                        padding: 12px 80px;
                        background: #003E4A;
                    }
                    .client-site-logo img {
                        content: url('https://www.casterconcepts.com/wp-content/uploads/2023/01/cci-logo-inverted.png');
                        background: transparent;
                        padding: 0;
                        border-radius: 0;
                        height: 48px;
                    }
                    .kray-mobile-menu-btn {
                        display: block !important;
                        position: absolute;
                        top: 12px;
                        right: 80px;
                        z-index: 11;
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        padding: 12px;
                        height: 48px;
                        width: 48px;
                    }
                    .kray-mobile-menu-btn svg {
                        width: 24px;
                        height: 24px;
                        fill: #ffffff;
                        display: block;
                    }
                    .kray-actions {
                        order: 2;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        justify-content: flex-start;
                        align-items: center;
                        gap: 8px;
                        margin: 12px 80px;
                        width: calc(100% - 160px);
                        min-width: 0;
                        flex: 0 0 auto;
                        max-width: none;
                    }
                    .kray-action-btn {
                        margin-left: 0 !important;
                        margin-right: 0 !important;
                        min-width: 0;
                        box-sizing: border-box;
                        padding: 0 8px;
                        font-size: 12px;
                        height: 40px;
                        justify-content: center;
                        text-align: center;
                    }
                    /* Request a Quote - first in visual order - min 148px, flexible */
                    .kray-action-btn:nth-child(3) {
                        order: 1;
                        min-width: 148px;
                        flex: 1 1 148px;
                        height: 40px;
                    }
                    /* Call button - second in visual order - min 148px, flexible */
                    .kray-action-btn:nth-child(1) {
                        order: 2;
                        min-width: 148px;
                        flex: 1 1 148px;
                        height: 40px;
                    }
                    .kray-action-btn:nth-child(1) .kray-phone-text {
                        display: inline;
                    }
                    /* Profile button - third in visual order - fixed 44px width, 40px height */
                    .kray-action-btn:nth-child(2) {
                        order: 3;
                        flex: 0 0 44px;
                        width: 44px;
                        height: 40px;
                    }
                    /* Show flag - fourth in visual order - fixed 90px */
                    .kray-actions .kray-flag {
                        display: flex !important;
                        order: 4;
                        width: 90px;
                        height: 65.9px;
                        flex: 0 0 90px;
                        margin-left: 8px;
                    }
                    .kray-category {
                        order: 1;
                        width: auto;
                        margin-bottom: 0;
                        margin-left: 0 !important;
                        min-width: 0;
                        flex: 0 0 auto;
                        max-width: none;
                    }
                    .kray-search-wrapper {
                        order: 3;
                        width: calc(100% - 160px);
                        max-width: none;
                        margin: 0 80px 12px 80px;
                        display: flex;
                        flex-direction: row;
                        gap: 0;
                        min-width: 469px;
                        flex: 0 0 auto;
                    }
                    .kray-category-select {
                        font-size: 14px !important;
                        height: 44px !important;
                        min-width: 70px !important;
                        width: auto !important;
                        flex: 0 0 auto !important;
                        max-width: 90px !important;
                        margin-right: 0 !important;
                        margin-left: 0 !important;
                        border-radius: 3px 0 0 3px;
                        box-sizing: border-box;
                        padding: 0 24px 0 12px !important;
                    }
                    .kray-search-input {
                        font-size: 14px !important;
                        height: 44px !important;
                        padding: 0 44px 0 12px !important;
                        min-width: 0 !important;
                        flex: 1 1 auto !important;
                        width: 100% !important;
                        max-width: none !important;
                        border-radius: 0 3px 3px 0;
                    }
                    .kray-search-button {
                        background: #80C343;
                        border: 1.5px solid #003E4A;
                        box-shadow: none;
                        border-radius: 3px;
                        height: 44px;
                        width: 44px;
                        min-width: 44px;
                        padding: 0;
                        top: 0;
                        right: 0;
                   }

                    .kray-search-wrapper {
                      position: relative;
                   }
                   .kray-suggestions-box {
                       width: calc(100% - 90px) !important; /* search input width (exclude 83px category dropdown) */
                      left: 90px !important; /* align with search input start */
                      right: auto !important;
                    }
                }

                /* Medium small screens: 349px - 628px */
                @media (min-width: 349px) and (max-width: 628px) {
                    /* Hide the mobile-header div from the live website */
                    .mobile-header {
                        display: none !important;
                        visibility: hidden !important;
                    }
                    
                    .kray-header-inner {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 0;
                        padding: 0;
                        position: relative;
                        margin: 0;
                        max-width: 100%;
                    }
                    .client-site-logo {
                        order: 1;
                        justify-content: flex-start;
                        margin-bottom: 0;
                        width: 100%;
                        min-width: 0;
                        flex: 1 1 0;
                        max-width: none;
                        position: relative;
                        padding: 12px 20px;
                        background: #003E4A;
                    }
                    .client-site-logo img {
                        content: url('https://www.casterconcepts.com/wp-content/uploads/2023/01/cci-logo-inverted.png');
                        background: transparent;
                        padding: 0;
                        border-radius: 0;
                        height: 48px;
                    }
                    .kray-mobile-menu-btn {
                        display: block !important;
                        position: absolute;
                        top: 12px;
                        right: 20px;
                        z-index: 11;
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        padding: 12px;
                        height: 48px;
                        width: 48px;
                    }
                    .kray-mobile-menu-btn svg {
                        width: 32px;
                        height: 32px;
                        fill: #ffffff;
                        display: block;
                    }
                    .kray-actions {
                        order: 2;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        justify-content: space-between;
                        align-items: center;
                        gap: 6px;
                        margin: 12px 12px;
                        width: calc(100% - 24px);
                        min-width: 0;
                        flex: 0 0 auto;
                        max-width: none;
                    }
                    .kray-action-btn {
                        margin-left: 0 !important;
                        margin-right: 0 !important;
                        min-width: 0;
                        box-sizing: border-box;
                        padding: 0 6px;
                        font-size: 11px;
                        height: 44px;
                        justify-content: center;
                        text-align: center;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    /* Request a Quote - first in visual order - flexible */
                    .kray-action-btn:nth-child(3) {
                        order: 1;
                        min-width: 0;
                        flex: 1 1 auto;
                        max-width: none;
                        width: 128px;
                        font-size: 13px;
                        margin-left: 5px !important;


                    
                    }
                    /* Call button - second in visual order - flexible */
                    .kray-action-btn:nth-child(1) {
                        order: 2;
                        min-width: 0;
                        flex: 1 1 auto;
                        max-width: none;
                    }
                    .kray-action-btn:nth-child(1) .kray-phone-text {
                        display: inline;
                    }
                    /* Profile button - third in visual order - fixed 44px */
                    .kray-action-btn:nth-child(2) {
                        order: 3;
                        flex: 0 0 44px;
                        width: 44px;
                        min-width: 44px;
                        margin-right: 5px !important;

                    }
                    /* Hide flag */
                    .kray-actions .kray-flag {
                        display: none !important;
                    }
                    .kray-category {
                        order: 1;
                        width: auto;
                        margin-bottom: 0;
                        margin-left: 0 !important;
                        margin-right: 0;
                        min-width: 0;
                        flex: 0 0 auto;
                        max-width: none;
                        margin-left: 12px !important;
                    }
                    .kray-search-wrapper {
                        order: 3;
                        width: calc(100% - 24px);
                        max-width: 100%;
                        margin: 0px 0px 10px 6px;
                        display: flex;
                        flex-direction: row;
                        gap: 0;
                        min-width: 0;
                        flex: 0 0 auto;
                    }
                    .kray-category-select {
                        font-size: 14px !important;
                        height: 44px !important;
                        min-width: 70px !important;
                        width: auto !important;
                        flex: 0 0 auto !important;
                        max-width: 90px !important;
                        margin-right: 0 !important;
                        margin-left: 0 !important;
                        border-radius: 3px 0 0 3px;
                        box-sizing: border-box;
                        padding: 0 24px 0 12px !important;
                    }
                    .kray-search-input {
                        font-size: 14px !important;
                        height: 44px !important;
                        padding: 0 44px 0 12px !important;
                        min-width: 0 !important;
                        flex: 1 1 auto !important;
                        width: 100% !important;
                        max-width: none !important;
                        border-radius: 0 3px 3px 0;
                    }
                    .kray-search-button {
                        background: #80C343;
                        border: 1.5px solid #003E4A;
                        box-shadow: none;
                        border-radius: 3px;
                        height: 44px;
                        width: 44px;
                        min-width: 44px;
                        padding: 0;
                        top: 0;
                        right: 0;
                    }

                    /* Suggestions box spans full search wrapper width at small screens */
                   .kray-search-wrapper {
                       position: relative;
                   }
                   .kray-suggestions-box {
                    width: calc(100% - 10px) !important;
                    left: 10px !important;
                    right: 0 !important;
                    }
                }

                /* Very small screens - below 349px */
                @media (max-width: 348px) {
                    .kray-actions {
                        gap: 3px;
                        margin: 8px 6px;
                        width: calc(100% - 12px);
                    }
                    .kray-action-btn {
                        padding: 0 3px;
                        font-size: 9px;
                        height: 44px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .kray-action-btn svg {
                        width: 20px;
                        height: 20px;
                    }
                    /* Request a Quote - must shrink */
                    .kray-action-btn:nth-child(3) {
                        flex: 1 1 auto;
                        max-width: none;
                        min-width: 0;
                        margin-left: 12px !important;
                        font-size: 13px;
                        width: 127px;


                    }
                    /* Call button */
                    .kray-action-btn:nth-child(1) {
                        flex: 1 1 auto;
                        max-width: none;
                        min-width: 0;
                    }
                    .kray-action-btn:nth-child(1) .kray-phone-text {
                        display: inline;
                        font-size: 12px;
                    }
                    /* Profile button */
                    .kray-action-btn:nth-child(2) {
                        flex: 0 0 40px;
                        width: 40px;
                        min-width: 40px;
                        margin-right: 12px !important;

                    }

                    .kray-search-wrapper {
                       position: relative;
                   }
                   .kray-suggestions-box {
                       width: 100% !important;
                       left: 0 !important;
                       right: 0 !important;
                   }
                }
            </style>

            <header class="kray-header">
                <div class="kray-header-inner">
                    <!-- Logo -->
                    <div class="client-site-logo">
                        <a href="/" class="client-site-logo-text">
                            <img src="${window.ClientSiteData.logoUrl}" alt="Logo">
                        </a>
                    </div>

                    <!-- Mobile Menu Button -->
                    <button class="kray-mobile-menu-btn" id="kray-mobile-menu-btn" aria-label="Menu">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                        </svg>
                    </button>

                    <!-- Search Bar with Dropdown -->
                    <div class="kray-search-wrapper">
                        <!-- Category Dropdown -->
                        <div class="kray-category">
                            <select class="kray-category-select" id="kray-category-select" aria-label="Select category">
                                ${window.ClientSiteData.categories.map(cat => `<option value="${cat.value}">${cat.label}</option>`).join('')}
                            </select>
                        </div>
                        <input 
                            type="text" 
                            class="kray-search-input" 
                            id="kray-search-input"
                            placeholder="Try 'noise reducing casters'"
                            aria-label="Search"
                        >
                        <button class="kray-search-button" id="kray-search-button" aria-label="Search">
                            <svg class="kray-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Action Buttons -->
                    <div class="kray-actions">
                        <a href="${window.ClientSiteData.actions.call}" class="kray-action-btn" aria-label="Call us">
                            <!--
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                            </svg>
                            -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#003E4A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-phone"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" /></svg>
                            <span class="kray-phone-text">${window.ClientSiteData.phoneDisplay}</span>
                        </a>
                        <a href="${window.ClientSiteData.actions.profile}" class="kray-action-btn" aria-label="Profile">
                            <!--
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                            -->
                            <img src="${window.ClientSiteData.profileIcon}" alt="Profile" width="25" height="25" style="vertical-align:middle;" />
                        </a>
                        <a href="${window.ClientSiteData.actions.quote}" class="kray-action-btn primary" aria-label="Request a quote">
                            <span>$</span> Request a Quote
                        </a>
                        <a href="${window.ClientSiteData.actions.usa}" class="kray-flag" aria-label="Made in USA">
                            <img src="${window.ClientSiteData.flagIcon}" alt="Made in USA">
                        </a>
                    </div>
                </div>
            </header>
        `;

        // Add event listeners for search functionality
        const searchInput = shadow.getElementById("kray-search-input");
        const searchButton = shadow.getElementById("kray-search-button");
        const categorySelect = shadow.getElementById("kray-category-select");

        const autocompleteManager = new AutocompleteManager(
            searchInput,
            searchButton,
            categorySelect,
            shadow
        );

        console.log("Kray Header: Successfully initialized with autocomplete");
    }

    /**
     * Initialize when DOM is ready
     */
    function onReady() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", initHeader);
        } else {
            initHeader();
        }
    }

    // Export init function for external access (e.g., Tampermonkey)
    window.KrayHeaderInit = initHeader;

    // Auto-initialize
    onReady();

})();
