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
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    position: relative;
                    z-index: 9999;
                }

                /* Inner wrapper for content */
                .kray-header-inner {
                    max-width: 2200px;
                    margin: 0 80px;
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

                /* Action buttons section */
                .kray-actions {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
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
                    width: 20px;
                    height: 20px;
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
                }

                .kray-mobile-menu-btn svg {
                    width: 32px;
                    height: 32px;
                    fill: #ffffff;
                }

                /* Responsive design */

                
                /* Full HD screens: 1920px */
                @media (min-width: 1920px) {
                    .kray-header-inner {
                        margin: 0 293px;
                    }
                }

                /* 2k/4k screens: larger horizontal margin */
                @media (min-width: 2560px) {
                    .kray-header-inner {
                        margin: 0 612.33px;
                    }
                }

                /* Mobile: hide USA flag, align action buttons in one row, search bar below */
                @media (max-width: 1199px) {
                    .kray-header-inner {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 0;
                        padding: 32px 12px 0px 12px;
                        position: relative;
                        margin: 0;
                        max-width: 100%;
                    }
                    .client-site-logo {
                        order: 1;
                        justify-content: flex-start;
                        margin-bottom: 12px;
                        margin-right: 0;
                        width: 100%;
                        min-width: 0;
                        flex: 1 1 0;
                        max-width: none;
                        position: relative;
                        padding: 6px 2vw;
                        background: #003E4A;
                        height: auto;
                    }
                    .client-site-logo img {
                        content: url('https://www.casterconcepts.com/wp-content/uploads/2023/01/cci-logo-inverted.png');
                        background: transparent;
                        padding: 0 8px;
                        border-radius: 0;
                        height: 48px;
                        width: auto;
                    }
                    .kray-mobile-menu-btn {
                        display: block;
                        position: absolute;
                        top: 38px;
                        right: 2vw;
                    }
                    .kray-actions {
                        order: 2;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        justify-content: flex-start;
                        align-items: center;
                        gap: 2px;
                        margin-bottom: 8px;
                        width: 100%;
                        min-width: 0;
                        flex: 1 1 0;
                        max-width: none;
                    }
                    .kray-action-btn {
                        margin-left: 0 !important;
                        margin-right: 0 !important;
                        width: 100%;
                        min-width: 0;
                        flex: 1 1 0;
                        max-width: none;
                        box-sizing: border-box;
                        padding: 0 12px;
                        font-size: 14px;
                        height: 48px;
                    }
                    .kray-action-btn:nth-child(1) {
                        order: 2;
                        flex: 1 1 auto;
                    }
                    .kray-action-btn:nth-child(1) .kray-phone-text {
                        display: inline;
                    }
                    .kray-action-btn:nth-child(2) {
                        order: 3;
                        flex: 0 0 auto;
                        width: auto;
                        margin-right: 12px !important;
                    }
                    .kray-action-btn:nth-child(3) {
                        order: 1;
                        flex: 1 1 auto;
                    }
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
                        height: auto;
                    }
                    .kray-search-wrapper {
                        order: 3;
                        width: 100%;
                        max-width: 100%;
                        margin: 0;
                        margin-right: 0;
                        display: flex;
                        flex-direction: row;
                        gap: 0;
                        min-width: 0;
                        flex: 1 1 auto;
                        height: auto;
                    }
                    .kray-search-input {
                        font-size: 16px !important;
                        height: 48px !important;
                        width: 100% !important;
                    }
                    .kray-search-button {
                        height: 48px !important;
                        width: 48px !important;
                    }
                }
            </style>

            <header class="kray-header">
                <div class="kray-header-inner">
                    <!-- Logo -->
                    <div class="client-site-logo">
                        <a href="/" class="client-site-logo-text">
                            <img src="https://www.casterconcepts.com/wp-content/uploads/2023/06/Caster-Concepts-Web-logo.png" alt="Logo">
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
                                <option value="all">All</option>
                                <option value="all-products">All Products</option>
                                <option value="casters">Casters</option>
                                <option value="wheels">Wheels</option>
                                <option value="accessories">Accessories</option>
                                <option value="replacement-parts">Replacement Parts</option>
                                <option value="learning-center">Learning Center</option>
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
                        <a href="tel:+18887641698" class="kray-action-btn" aria-label="Call us">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                            </svg>
                            <span class="kray-phone-text">(888) 764-1698</span>
                        </a>
                        <a href="/profile" class="kray-action-btn" aria-label="Profile">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                        </a>
                        <a href="/quote" class="kray-action-btn primary" aria-label="Request a quote">
                            <span>$</span> Request a Quote
                        </a>
                        <a href="/" class="kray-flag" aria-label="Made in USA">
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
