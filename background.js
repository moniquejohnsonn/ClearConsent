// Listen for active tab changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const hostname = new URL(tab.url).hostname;
        console.log("Visiting hostname: ", hostname)
        checkPrivacySpy(hostname).then(details => {
            if (details) {
                // Check if chrome.storage.local is available
                if (chrome.storage && chrome.storage.local) {
                    chrome.storage.local.set({privacyDetails: details}, () => {
                        console.log("Details saved to storage.");
                    });
                } else {
                    console.error("chrome.storage.local is unavailable.");
                }
            }
        });
    }
});

// Function to fetch and check the PrivacySpy index for hostname matches
async function checkPrivacySpy(hostname) {
    try {
        // Normalize hostname (remove 'www.' if present)
        const normalizedHostname = hostname.replace(/^www\./, '');
        console.log("Normalized hostname: ", normalizedHostname);

        // Step 1: Fetch the PrivacySpy index
        const response = await fetch('https://privacyspy.org/api/v2/index.json');
        const indexData = await response.json();

        // Step 2: Find a matching hostname in the index
        const matchedProduct = indexData.find(product =>
            product.hostnames.includes(normalizedHostname)
        );

        // If a match is found, fetch additional details
        if (matchedProduct) {
            const slug = matchedProduct.slug;
            return await getPrivacySpyDetails(slug); // Pass the slug to fetch details
        } else {
            console.log("No privacy data found for this hostname.");
            return null;
        }
    } catch (error) {
        console.error("Error checking PrivacySpy:", error);
    }
}

// Function to fetch PrivacySpy details based on slug
async function getPrivacySpyDetails(slug) {
    try {
        const response = await fetch(`https://privacyspy.org/api/v2/products/${slug}.json`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching PrivacySpy details:", error);
        return null;
    }
}

// Listen for messages from popup.js and respond with the data from storage
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getPrivacyData") {
        chrome.storage.local.get("privacyDetails", (result) => {
            if (chrome.runtime.lastError) {
                console.error("Error accessing chrome.storage.local:", chrome.runtime.lastError);
                sendResponse({ data: null });
                return;
            }
            sendResponse({ data: result.privacyDetails });
        });
        return true;
    }
});