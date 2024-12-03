document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayPrivacyDetails();

    document.getElementById('summary').addEventListener('change', handleSelectionChange);

    document.getElementById('navigate-button').addEventListener('click', navigateToDetails);
});


function handleSelectionChange() {
    const selectedItems = document.querySelectorAll('.select-item:checked');
    const navigateButton = document.getElementById('navigate-button');

    if (selectedItems.length > 0) {
        navigateButton.style.display = 'block';
    } else {
        navigateButton.style.display = 'none';
    }
}

function fetchAndDisplayPrivacyDetails() {
    chrome.runtime.sendMessage({ type: "getPrivacyData" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error getting privacy data:", chrome.runtime.lastError);
            document.getElementById('summary').innerText = "Error loading summary.";
            return;
        }

        const data = response.data;

        const iconElement = document.getElementById('icon');
        if (data.icon && iconElement) {
            const iconUrl = `https://privacyspy.org/static/icons/${data.icon}`;
            console.log("image source url: ", iconUrl)
            iconElement.src = iconUrl;  // Update the icon's source
        }

        document.getElementById('hostname').innerText = data.name;


        // Filter for handling and collection categories from api
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
                backgroundColor = "#FF5B61";
                visibilityClass = 'colors';
                checkboxHtml = `<input type="checkbox" class="select-item" data-question="${entry.question.text}" data-option="${entry.option.text}">`;
            } else if (percent < 70) {
                backgroundColor = "#ffcc5c";
                visibilityClass = 'colors';
                checkboxHtml = `<input type="checkbox" class="select-item" data-question="${entry.question.text}" data-option="${entry.option.text}">`;
            } else {
                backgroundColor = "#96ceb4";
                visibilityClass = 'hidden-green'; // Add a class to hide green items by default
            }

            return `
                <div class="privacy-item ${visibilityClass}" style="background-color: ${backgroundColor};">
                ${checkboxHtml}
                <img class="note-icon" src="/images/note-icon.png" alt="Note Icon">
                    <p><strong>${entry.question.text}:</strong> ${entry.option.text}</p>
                </div>
            `;
        }).join('');

        // Update the summary div with the result
        document.getElementById('summary').innerHTML = summaryText;

        // Add event listener to the toggle button
        document.getElementById('toggle-green').addEventListener('click', toggleGreenItems);
    });
}

function navigateToDetails() {
    const selectedItems = Array.from(document.querySelectorAll('.select-item:checked'))
        .map(item => ({
            question: item.getAttribute('data-question'),
            option: item.getAttribute('data-option')
        }));

    // debugging - ensure items selected are captured
    console.log('Selected Items:', selectedItems);

    const selectedItemsJson = encodeURIComponent(JSON.stringify(selectedItems));

    window.location.href = `customize-letter.html?items=${selectedItemsJson}`;
}


function toggleGreenItems() {
    const greenItems = document.querySelectorAll('.privacy-item.green');
    const hiddenColorItems = document.querySelectorAll('.privacy-item.hidden-colors');
    const hiddenGreenItems = document.querySelectorAll('.privacy-item.hidden-green');
    const colorItems = document.querySelectorAll('.privacy-item.colors');
    const toggleSwitch = document.getElementById('toggle-green');

    // Check if the toggle is on
    if (toggleSwitch.checked) {
        // Show green items (remove hidden-green and add green class)
        hiddenGreenItems.forEach(item => {
            item.classList.remove('hidden-green');
            item.classList.add('green');
        });

        // Hide red/yellow items (remove colors and add hidden-colors class)
        colorItems.forEach(item => {
            item.classList.remove('colors');
            item.classList.add('hidden-colors');
        });

        document.getElementById('toggle-text').innerText = "Hide Good Policies";
    } else {
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

        document.getElementById('toggle-text').innerText = "See Good Policies";
    }
}