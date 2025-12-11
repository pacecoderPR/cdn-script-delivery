/**
 * Dynamic Header Component with Enhanced Search Bar
 * 
 * This script dynamically injects a custom header with a large search bar
 * into any website by replacing existing headers. It uses Shadow DOM to
 * ensure style isolation and prevent conflicts with existing site styles.
 * 
 * Usage:
 * 1. Add placeholder: <div id="kray-header"></div>
 * 2. Include script: <script src="[CDN_URL]/client_header.js"></script>
 * 
 * The script will:
 * - Hide existing site headers
 * - Inject custom header into #kray-header placeholder
 * - Use Shadow DOM for style isolation
 */

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

                /* Main header container */

                .kray-header {
                    width: 100%;
                    background: #ffffff;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    position: relative;
                    z-index: 9999;
                }

                /* Inner wrapper for content */
                .kray-header-inner {
                    max-width: 2200px;
                    margin: 0 auto;
                    padding: 32px 80px;
                    min-height: 90px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                /* Logo section */
                .kray-logo {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                }

                .kray-logo img {
                    height: 67px;
                    width: auto;
                }

                .kray-logo-text {
                    font-size: 26px;
                    font-weight: 700;
                    color: #222;
                    text-decoration: none;
                }

                /* Category dropdown */
                .kray-category {
                    flex-shrink: 0;
                    margin-left: 12px;
                    position: relative;
                }

                .kray-category-select {
                    height: 56px;
                    padding: 0 40px 0 20px;
                    border: 1px solid #003E4A;
                    box-shadow: 0 2px 8px 0 rgba(128, 195, 67, 0.18);
                    border-radius: 3px 0 0 3px;
                    font-size: 18px;
                    color: #374151;
                    background: #ffffff;
                    cursor: pointer;
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 16px center;
                    min-width: 340px;
                    margin-right: 16px;
                    margin-right: 0;
                    position: relative;
                    z-index: 2;
                }

                .kray-category-select:hover {
                    border-color: #003E4A;
                }

                .kray-category-select:focus {
                    outline: none;
                    border-color: #003E4A;
                }

                /* Search bar section */
                .kray-search-wrapper {
                    flex: 4;
                    max-width: 1600px;
                    display: flex;
                }

                .kray-search-input {
                    width: 100%;
                    height: 56px;
                    padding: 0 48px;
                    border: 1px solid #003E4A;
                    box-shadow: 0 2px 8px 0 rgba(128, 195, 67, 0.18);
                    border-radius: 0 3px 3px 0;
                    font-size: 22px;
                    color: #1f2937;
                    background: #ffffff;
                    transition: all 0.2s ease;
                    margin-left: 0;
                }

                .kray-search-input::placeholder {
                    color: #9ca3af;
                }

                .kray-search-input:hover {
                    border-color: #003E4A;
                }

                .kray-search-input:focus {
                    outline: none;
                    border-color: #003E4A;
                }

                .kray-search-button {
                    background: #80C343;
                    border: 1px solid #003E4A;
                    box-shadow: 0 2px 8px 0 rgba(128, 195, 67, 0.18);
                    border-radius: 0 3px 3px 0;
                    padding: 0 18px;
                    height: 56px;
                    min-width: 56px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: -6px;
                    z-index: 2;
                }

                .kray-search-button:hover {
                    background: #003E4A;
                }

                .kray-search-button:active {
                    background: #4d7c0f;
                }

                .kray-search-icon {
                    width: 20px;
                    height: 20px;
                    fill: #ffffff;
                }

                /* Action buttons section */
                .kray-actions {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .kray-action-btn {
                    padding: 0 22px;
                    height: 56px;
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
                    gap: 6px;
                    margin-left: 16px;
                }

                .kray-action-btn:hover {
                    background: #f9fafb;
                    border-color: #003E4A;
                }

                .kray-action-btn.primary {
                    background: #80C343;
                    color: #003E4A;
                    border-color: #003E4A;
                    font-weight: 600;
                }

                .kray-action-btn.primary:hover {
                    background: #003E4A;
                    color: #fff;
                }

                /* USA Flag */
                .kray-flag {
                    width: 110px;
                    height: 80px;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .kray-flag img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* Responsive design */
                @media (max-width: 1024px) {
                    .kray-header-inner {
                        gap: 12px;
                    }

                    .kray-search-wrapper {
                        max-width: 400px;
                    }

                    .kray-action-btn span {
                        display: none;
                    }
                }

                @media (max-width: 768px) {
                    .kray-header-inner {
                        flex-wrap: wrap;
                        padding: 12px 16px;
                    }

                    .kray-search-wrapper {
                        order: 3;
                        flex-basis: 100%;
                        max-width: 100%;
                    }

                    .kray-category-select {
                        min-width: 100px;
                        font-size: 13px;
                    }

                    .kray-actions {
                        gap: 8px;
                    }
                }

                @media (max-width: 480px) {
                    .kray-logo-text {
                        font-size: 16px;
                    }

                    .kray-action-btn {
                        padding: 8px 12px;
                        font-size: 13px;
                    }
                }
            </style>

            <header class="kray-header">
                <div class="kray-header-inner">
                    <!-- Logo -->
                    <div class="kray-logo">
                        <a href="/" class="kray-logo-text">
                            <img src="https://www.casterconcepts.com/wp-content/uploads/2023/06/Caster-Concepts-Web-logo.png" alt="Logo">
                        </a>
                    </div>

                    <!-- Category Dropdown -->
                    <div class="kray-category">
                        <select class="kray-category-select" id="kray-category-select" aria-label="Select category">
                            <option value="all">All</option>
                            <option value="all-products">All Products</option>
                            <option value="casters">Casters</option>
                            <option value="wheels">Wheels</option>
                            <option value="accessories">Accessories</option>
                            <option value="replacement-parts">Replacement Parts</option>
                            <option value="learning-center">Learning Center</option>
                        </select>
                    </div>

                    <!-- Search Bar -->
                    <div class="kray-search-wrapper">
                        <input 
                            type="text" 
                            class="kray-search-input" 
                            id="kray-search-input"
                            placeholder="Try 'casters carrying load of 15,000 lbs'"
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
                        <a href="tel:+1234567890" class="kray-action-btn" aria-label="Call us">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                            </svg>
                        
                        </a>
                        <a href="/profile" class="kray-action-btn" aria-label="Profile">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                        
                        </a>
                        <a href="/quote" class="kray-action-btn primary" aria-label="Request a quote">
                            <span>$</span> Request a Quote
                        </a>
                        <a href="" class="kray-flag" aria-label="Made in USA">
                            <img src="https://www.casterconcepts.com/wp-content/uploads/2025/06/MIA-logo.png" alt="Made in USA">
                        </a>
                    </div>
                </div>
            </header>
        `;

        // Add event listeners for search functionality
        const searchInput = shadow.getElementById("kray-search-input");
        const searchButton = shadow.getElementById("kray-search-button");
        const categorySelect = shadow.getElementById("kray-category-select");

        function performSearch() {
            const query = searchInput.value.trim();
            const category = categorySelect.value;
            
            if (query) {
                // Build search URL - customize based on client's search implementation
                const searchUrl = `/search?q=${encodeURIComponent(query)}&category=${category}`;
                window.location.href = searchUrl;
            }
        }

        // Search button click
        searchButton.addEventListener("click", performSearch);

        // Enter key in search input
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                performSearch();
            }
        });

        console.log("Kray Header: Successfully initialized");
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
