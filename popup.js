document.addEventListener('DOMContentLoaded', function () {
    const summarizeButton = document.getElementById('summarize-btn');
    const summaryElement = document.getElementById('summary');  // Element where the summary will be displayed

    if (summarizeButton) {
        summarizeButton.addEventListener('click', () => {
            console.log("Summarize button clicked");

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const tabId = tabs[0].id;

                // Inject content script before sending the message
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js'] // Ensure content script is injected
                }, () => {
                    console.log("Content script injected");

                    // After injecting, execute the function to collect terms text
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        function: collectTermsText
                    });
                });
            });
        });
    }

    // Listen for the summary message from background.js
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "show_summary") {
            console.log("Summary received in popup:", message.summary);
            // Display the summary in the popup
            summaryElement.innerText = message.summary;
        }
    });
});

// Function to collect the text from the page
function collectTermsText() {
    console.log("Collecting terms text...");
    let termsText = document.body.innerText;
    chrome.runtime.sendMessage({ action: "terms_extracted", terms: termsText });
}