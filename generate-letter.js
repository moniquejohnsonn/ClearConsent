document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedItems = JSON.parse(decodeURIComponent(urlParams.get('items') || '[]'));
    const locationSelector = document.getElementById('location-selector');
    const generateButton = document.getElementById('generate-letter');
    const concerns = formatPrivacyConcerns(selectedItems);

    console.log("Raw Selected Items:", selectedItems);
    console.log("Formatted Concerns:", concerns);

    // Enable the button only when a valid location is selected
    locationSelector.addEventListener('change', () => {
        generateButton.disabled = locationSelector.value === "default";
    });

    generateButton.addEventListener('click', () => {
        console.log("Generate Letter button clicked");
        generateLetter(concerns);
    });
});

// allow user to go back to the 'home' screen
document.getElementById('back-button').addEventListener('click', function() {
    window.location.href = 'popup.html';
});

// format the privacy questions into statements for AI
function formatPrivacyConcerns(concerns) {
    return concerns.map(concern => {
        if (typeof concern === 'object' && concern.question) {
            return `${concern.question.replace('Does the', 'The').replace('?', '')}.`;
        }
        return "Unknown privacy concern.";
    });
}

async function generateLetter(concerns) {
    const location = document.getElementById('location-selector').value;

    if (!location || location === "default") {
        alert("Please select a location.");
        return;
    }

    const formattedConcerns = concerns.join('\n');


    // Create a structured prompt for the AI model
    const prompt = `
Write a formal letter requesting to opt out of specific privacy practices based on ${location} privacy laws. 
The letter should include:
1. A professional greeting.
2. A clear statement of intent to opt out of privacy practices.
3. A list of the privacy concerns selected by the user.
4. A polite closing.

Privacy concerns:
${formattedConcerns}
`;

    try {
        console.log("Generated Prompt:", prompt);

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer `  // Replace with your OpenAI API key
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo-0125",
                messages: [
                    {role: "system", content: "You are a professional legal letter-writing assistant."},
                    {role: "user", content: prompt}
                ],
                max_tokens: 500,
            })
        });

        const result = await response.json();
        console.log("Full response from OpenAI:", result);

        // pull response and place in output area
        if (result && result.choices && result.choices[0]) {
            const generatedText = result.choices[0].message.content;
            document.getElementById('letter-output').textContent = generatedText || "No content generated.";
        } else {
            console.error("Error: Invalid response format", result);
            document.getElementById('letter-output').textContent = "Error: Could not generate letter.";
        }
    } catch (error) {
        console.error("Error generating the letter:", error);
        document.getElementById('letter-output').textContent = "Error generating the letter.";
    }
}