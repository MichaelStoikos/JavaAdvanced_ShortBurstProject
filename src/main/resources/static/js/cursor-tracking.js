// Cursor Tracking for Collaborative Editing

const cursors = new Map(); // userId -> cursor element
let lastCursorUpdate = 0;
const CURSOR_UPDATE_THROTTLE = 50; // ms

function initCursorTracking(cy, boardId) {
    // Create cursor container
    const cursorContainer = document.createElement('div');
    cursorContainer.id = 'cursor-container';
    cursorContainer.style.position = 'absolute';
    cursorContainer.style.top = '0';
    cursorContainer.style.left = '0';
    cursorContainer.style.width = '100%';
    cursorContainer.style.height = '100%';
    cursorContainer.style.pointerEvents = 'none';
    cursorContainer.style.zIndex = '1000';
    cy.container().appendChild(cursorContainer);
    
    // Track mouse movement
    const cyContainer = cy.container();
    cyContainer.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastCursorUpdate < CURSOR_UPDATE_THROTTLE) return;
        lastCursorUpdate = now;
        
        // Get position relative to cytoscape canvas
        const rect = cyContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convert to cytoscape coordinates
        const pan = cy.pan();
        const zoom = cy.zoom();
        const cyX = (x - pan.x) / zoom;
        const cyY = (y - pan.y) / zoom;
        
        // Send cursor position
        sendCursorPosition(boardId, cyX, cyY);
    });
    
    // Hide cursor when leaving canvas
    cyContainer.addEventListener('mouseleave', () => {
        // Could send a "hide cursor" event here
    });
}

async function sendCursorPosition(boardId, x, y) {
    const mutation = `
        mutation UpdateCursor($boardId: ID!, $x: Float!, $y: Float!) {
            updateCursor(boardId: $boardId, x: $x, y: $y)
        }
    `;
    
    try {
        await graphqlRequest(mutation, { boardId, x, y });
    } catch (error) {
        // Silently fail for cursor updates
        console.debug('Cursor update failed:', error);
    }
}

function subscribeToCursorMovements(boardId) {
    const query = `
        subscription CursorMoved($boardId: ID!) {
            cursorMoved(boardId: $boardId) {
                userId
                username
                x
                y
                timestamp
            }
        }
    `;
    
    subscribe(query, { boardId }, (data) => {
        const cursor = data.cursorMoved;
        
        // Don't show our own cursor - we can see our real cursor!
        if (isOwnCursor(cursor.userId)) {
            console.log('⏭️ Skipping own cursor update');
            return;
        }
        
        updateRemoteCursor(cursor);
    });
}

// Check if cursor belongs to current user
function isOwnCursor(userId) {
    // We need to get the current user's ID
    // We'll store it when the page loads
    return userId === window.currentUserId;
}

function updateRemoteCursor(cursorData) {
    const { userId, username, x, y } = cursorData;
    
    let cursorElement = cursors.get(userId);
    
    if (!cursorElement) {
        // Create new cursor
        cursorElement = createCursorElement(userId, username);
        cursors.set(userId, cursorElement);
        document.getElementById('cursor-container').appendChild(cursorElement);
    }
    
    // Update cursor position
    const pan = cy.pan();
    const zoom = cy.zoom();
    const screenX = x * zoom + pan.x;
    const screenY = y * zoom + pan.y;
    
    cursorElement.style.left = screenX + 'px';
    cursorElement.style.top = screenY + 'px';
    
    // Reset fade-out timer
    clearTimeout(cursorElement.fadeTimeout);
    cursorElement.style.opacity = '1';
    
    // Fade out after 3 seconds of inactivity
    cursorElement.fadeTimeout = setTimeout(() => {
        cursorElement.style.opacity = '0.3';
    }, 3000);
}

function createCursorElement(userId, username) {
    const cursor = document.createElement('div');
    cursor.className = 'remote-cursor';
    cursor.dataset.userId = userId;
    
    // Generate a consistent color for this user
    const color = getUserColor(userId);
    
    cursor.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
            <path d="M5.5 3.21V20.8L12.5 14.5L16.5 20.5L18.5 19.5L14.5 13.5L22 12.5L5.5 3.21Z" 
                  fill="${color}" stroke="white" stroke-width="1"/>
        </svg>
        <div class="cursor-label" style="
            background: ${color};
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
            margin-left: 20px;
            margin-top: -4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">${username}</div>
    `;
    
    cursor.style.position = 'absolute';
    cursor.style.pointerEvents = 'none';
    cursor.style.transition = 'opacity 0.3s, left 0.1s, top 0.1s';
    cursor.style.zIndex = '1000';
    cursor.style.display = 'flex';
    cursor.style.alignItems = 'center';
    
    return cursor;
}

function getUserColor(userId) {
    // Generate consistent color from userId
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
        '#F8B739', '#52B788', '#E76F51', '#2A9D8F'
    ];
    
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
}

// Update cursor positions on pan/zoom
function updateCursorPositionsOnViewChange() {
    cursors.forEach((cursorElement, userId) => {
        // Cursors will be updated on next mouse move
        // This is just to ensure they stay in sync with the view
    });
}

