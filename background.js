chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received in background script:", message);

    if (message.action === "terms_extracted") {
        const termsText = message.terms;
        console.log("Terms extracted:", termsText);

        summarizeWithAI(termsText).then((summary) => {
            console.log("Summary received from AI:", summary);
            // Send the summary back to the extension
            chrome.runtime.sendMessage({action: "show_summary", summary: summary});
        }).catch((error) => {
            console.error("Error summarizing:", error);
            chrome.runtime.sendMessage({action: "show_summary", summary: "Error: Could not summarize terms."});
        });
    }
});


async function summarizeWithAI(text) {
    const apiKey = 'API_KEY_HERE';  // Replace with your Hugging Face API key
    const response = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text })
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error("ClearConsent: " + errorMessage);
    }

    const result = await response.json();
    return result[0].summary_text;
}
