document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayPrivacyDetails(); // Load and display data immediately
});

function fetchAndDisplayPrivacyDetails() {
    chrome.runtime.sendMessage({ type: "getPrivacyData" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error getting privacy data:", chrome.runtime.lastError);
            document.getElementById('summary').innerText = "Error loading summary.";
            return;
        }

        const data = response.data;

        // Check if the #icon element exists in the HTML, then set its src attribute
        const iconElement = document.getElementById('icon');
        if (data.icon && iconElement) {
            const iconUrl = `https://privacyspy.org/static/icons/${data.icon}`;
            console.log("image source url: ", iconUrl)
            iconElement.src = iconUrl;  // Update the icon's source
        }

        document.getElementById('hostname').innerText = data.name;


        // Filter for handling and collection categories
        const handlingCollection = data.rubric.filter(entry =>
            entry.question.category === "handling" || entry.question.category === "collection"
        );

        // Create items with color based on the percentage
        const summaryText = handlingCollection.map(entry => {
            const percent = entry.option.percent; // Get the percentage value

            // Determine background color based on the percent
            let backgroundColor;
            let visibilityClass = ''; // Default visibility (visible)
            if (percent < 50) {
                backgroundColor = "red";
                visibilityClass = 'colors'
            } else if (percent < 70) {
                backgroundColor = "yellow";
                visibilityClass = 'colors'
            } else {
                backgroundColor = "green";
                visibilityClass = 'hidden-green'; // Add a class to hide green items by default
            }

            return `
                <div class="privacy-item ${visibilityClass}" style="background-color: ${backgroundColor};">
                    <p><strong>${entry.question.text}:</strong> ${entry.option.text}</p>
                    <p><em>Privacy Score: ${percent}%</em></p>
                </div>
            `;
        }).join('');

        // Update the summary div with the result
        document.getElementById('summary').innerHTML = summaryText;

        // Add event listener to the toggle button
        document.getElementById('toggle-green').addEventListener('click', toggleGreenItems);
    });
}


function toggleGreenItems() {
    const greenItems = document.querySelectorAll('.privacy-item.green');
    const hiddenColorItems = document.querySelectorAll('.privacy-item.hidden-colors')

    // Check if the toggle is on (green items are currently shown)
    if (document.getElementById('toggle-green').classList.contains('on')) {
        // Hide green items (remove the green class and add hidden-green class)
        greenItems.forEach(item => {
            item.classList.remove('green');
            item.classList.add('hidden-green');
        });

        // Show red/yellow items (remove hidden-colors and add colors class)
        hiddenColorItems.forEach(item => {
            item.classList.remove('hidden-colors');
            item.classList.add('colors');
        });

        // Change button text to "See Good Policies"
        document.getElementById('toggle-green').innerText = "See Good Policies";
    } else {
        // Show green items (remove hidden-green and add green class)
        const hiddenGreenItems = document.querySelectorAll('.privacy-item.hidden-green');
        const colorItems = document.querySelectorAll('.privacy-item.colors');

        hiddenGreenItems.forEach(item => {
            item.classList.remove('hidden-green');
            item.classList.add('green');
        });

        // Hide red/yellow items (remove colors and add hidden-colors class)
        colorItems.forEach(item => {
            item.classList.remove('colors');
            item.classList.add('hidden-colors');
        });

        // Change button text to "Hide Good Policies"
        document.getElementById('toggle-green').innerText = "Hide Good Policies";
    }

    // Toggle the button's "on" state (showing green items)
    document.getElementById('toggle-green').classList.toggle('on');
}