console.log("Email Writer Extension - Content Script Loaded");

var observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some((node) =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500); 
        }
    }
});

// Start observing the document body
observer.observe(document.body, {
    childList: true,
    subtree: true
});
console.log('Observer is observing...');

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

function getEmailContent() {
    const selectors = [
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];
    for (const selector of selectors) {
        const contentElement = document.querySelector(selector);
        if (contentElement) {
            // Extract only visible text
            let content = contentElement.innerText.trim();

            // Remove sender name, email, or other metadata
            content = content.replace(/.*\n.*\n/, ''); // Removes "Lalit Patel\nSat, Jan 25, 6:44 PM\n"
            return content;
        }
    }
}



function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            console.log('Compose toolbar found:', toolbar);
            return toolbar;
        }
    }
    console.warn('Compose toolbar not found');
    return null;
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) {
        existingButton.remove();
    }

    console.log('Injecting AI Button...');
    const toolbar = findComposeToolbar();

    if (!toolbar) {
        console.log("Toolbar not found, cannot inject AI button");
        return;
    }

    const button = createAIButton();
    button.classList.add('ai-reply-button');

    button.addEventListener('click', async () => {
        button.addEventListener('click', async () => {
            try {
                button.innerHTML = 'Generating...';
                if(button.click) {
                    button.disabled = true;
                } else {
                    button.disabled = false;
                }
                const emailContent = getEmailContent();
                if (!emailContent) {
                    alert('No email content detected to generate a reply.');
                    throw new Error('Email content is empty');
                }
                console.log('Email Content:', emailContent);
                const response = await fetch('http://localhost:8080/api/email/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        emailContent: emailContent,
                        tone: "professional"
                    })
                });
                console.log('Response Status:', response.status, response.statusText);

                if (!response.ok) {
                    console.error('API Request failed:', response.status, response.statusText);
                    throw new Error(`API Request Failed: ${response.status} ${response.statusText}`);
                }
        
                const generatedReply = await response.text();
                const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
        
                console.log(response);
                if (composeBox) {
                    composeBox.focus();
                    document.execCommand('insertText', false, generatedReply);
                } else {
                    console.error('Compose box not found');
                    alert('Failed to find the compose box to insert the reply');
                }
            } catch (error) {
                console.error('Error generating reply:', error);
                alert(`Failed to generate reply. Please try again.\nError: ${error.message}`);
            } finally {
                button.innerHTML = 'AI Reply';
                button.disabled = false;
            }
        });
});     

    // Insert the button into the toolbar
    toolbar.insertBefore(button, toolbar.firstChild);
}

const cors = require('cors');
app.use(cors());