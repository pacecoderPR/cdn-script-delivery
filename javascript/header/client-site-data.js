(function() {
    'use strict';

    // Site data object - all configurable constants
    const ClientSiteData = {
        // Logo URLs
        logoUrl: "https://www.casterconcepts.com/wp-content/uploads/2023/06/Caster-Concepts-Web-logo.png",
        invertedLogoUrl: "https://www.casterconcepts.com/wp-content/uploads/2023/01/cci-logo-inverted.png",
        
        // Contact info
        phone: "888-351-8453",
        phoneDisplay: "(888) 351-8453",
        
        // Icons
        profileIcon: "https://www.casterconcepts.com/wp-content/uploads/2024/05/user.svg",
        flagIcon: "https://www.casterconcepts.com/wp-content/uploads/2025/06/MIA-logo.png",
        
        // Search categories
        categories: [
            { value: "all", label: "All" },
            { value: "all_products", label: "All Products" },
            { value: "casters", label: "Casters" },
            { value: "wheels", label: "Wheels" },
            { value: "accessories", label: "Accessories" },
            { value: "replacement_parts", label: "Replacement Parts" },
            { value: "learning_centers", label: "Learning Center" }
        ],
        
        // Action URLs
        actions: {
            call: "tel:888-351-8453",
            profile: "/user-profile",
            quote: "/request-a-quote/?pid=44409",
            usa: "/usa-made-heavy-duty-casters"
        },

        // URL redirection logic for search
        redirectToSearch: function(category, query) {
            if (!query) return;
            const searchUrl = `/?filter=${encodeURIComponent(category)}&s=${encodeURIComponent(query).replace(/%20/g, '+')}&q=search-results`;
            window.location.href = searchUrl;
        }
    };

    // Expose to global scope for use in other scripts
    window.ClientSiteData = ClientSiteData;

})();
