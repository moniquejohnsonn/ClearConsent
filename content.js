chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received in content script:", message);

    if (message.action === "show_summary") {
        // Display the summary, here we use an alert for simplicity
        alert("Summary: " + message.summary);
        console.log("Summary shown:", message.summary);
    }
});